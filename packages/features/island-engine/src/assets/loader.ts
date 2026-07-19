/**
 * GLB 資產載入器（Draco ＋ Meshopt）
 *
 * 載入失敗（缺檔、網路錯誤、解碼失敗）一律回傳 manifest 定義的簡單幾何體，
 * 場景不因任何單一資產失敗而中斷（驗收 3.3：缺檔時場景仍完整可玩）。
 */

import {
  type AnimationClip,
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  type Object3D,
  SphereGeometry,
} from "three";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { FallbackShape, getManifestEntry, type IAssetManifestEntry } from "./manifest";

const DEFAULT_DRACO_DECODER_PATH = "https://www.gstatic.com/draco/versioned/decoders/1.5.7/";

/**
 * 偵測 iOS / iPadOS（含偽裝成桌面 Safari 的 iPad）
 */
const isIOS = (): boolean => {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent ?? "";
  const platform = navigator.platform ?? "";
  const byUserAgent = /iPad|iPhone|iPod/.test(ua);
  const iPadOSDesktopMode = /Mac/.test(platform) && navigator.maxTouchPoints > 1;
  return byUserAgent || iPadOSDesktopMode;
};

/**
 * iOS Safari 17+ 的 GLTFLoader 會走 ImageBitmapLoader，但 iOS WebKit 對 ImageBitmap
 * 貼圖有已知缺陷：超過記憶體上限時貼圖被拒，模型渲染成全白/全黑（桌面正常、且是間歇性
 * 的「部分貼圖失敗」）。three 只對 Safari < 17 自動停用 ImageBitmap，17+ 仍會踩雷。
 * 這裡在 iOS 停用 createImageBitmap，逼 GLTFLoader 退回 ImageLoader（HTMLImageElement）。
 * 必須在 `new GLTFLoader()` 之前執行——GLTFLoader 在建構時就決定用哪個 loader。
 * 參考：https://discourse.threejs.org/t/textures-in-gltf-sometimes-display-black-but-only-on-ios/30520
 */
const disableImageBitmapForIOS = (): void => {
  if (typeof window === "undefined") return;
  if (isIOS() && "createImageBitmap" in window) {
    (window as unknown as { createImageBitmap?: unknown }).createImageBitmap = undefined;
  }
};

export interface IAssetLoaderOptions {
  /** GLB 檔案的 base URL，預設 "/models/island/" */
  baseUrl?: string;
  dracoDecoderPath?: string;
  /** 測試注入點：覆寫實際的 GLTF 載入實作 */
  loadGltf?: (url: string) => Promise<{ scene: Object3D; animations?: AnimationClip[] }>;
}

export interface IAssetLoader {
  /** 載入 manifest 內的資產；失敗回傳 fallback 幾何體（永不 reject） */
  load(key: string): Promise<Object3D>;
  dispose(): void;
}

/**
 * 模型後處理：投射/接收陰影＋材質正規化。
 * Kenney glTF 匯出常帶 metallicFactor=1，無環境貼圖時背光面全黑——一律歸零。
 */
const shadowify = (object: Object3D): void => {
  object.traverse((child) => {
    const mesh = child as Mesh;
    if (mesh.isMesh) {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const material of materials) {
        if (material instanceof MeshStandardMaterial) {
          material.metalness = 0;
          material.roughness = Math.max(material.roughness, 0.8);
        }
      }
    }
  });
};

/**
 * 依 manifest fallback 描述建立簡單幾何體替代物
 */
export const buildFallbackObject = (entry: IAssetManifestEntry): Object3D => {
  const [width, height, depth] = entry.fallback.size;
  let mesh: Mesh;
  const material = new MeshStandardMaterial({ color: entry.fallback.color, roughness: 0.9 });
  switch (entry.fallback.shape) {
    case FallbackShape.cone:
      mesh = new Mesh(new ConeGeometry(width / 2, height, 8), material);
      break;
    case FallbackShape.cylinder:
      mesh = new Mesh(new CylinderGeometry(width / 2, width / 2, height, 10), material);
      break;
    case FallbackShape.sphere:
      mesh = new Mesh(new SphereGeometry(width / 2, 12, 10), material);
      break;
    default:
      mesh = new Mesh(new BoxGeometry(width, height, depth), material);
  }
  // 底部貼地（幾何體中心在原點，往上抬半高）
  mesh.position.y = height / 2;
  shadowify(mesh);

  const group = new Group();
  group.name = `${entry.key}:fallback`;
  group.userData.isFallback = true;
  group.add(mesh);
  group.scale.setScalar(entry.scale);
  return group;
};

/**
 * 建立資產載入器；同 key 併發/重複載入共用同一 promise
 */
export const createAssetLoader = (options: IAssetLoaderOptions = {}): IAssetLoader => {
  const baseUrl = options.baseUrl ?? "/models/island/";
  const cache = new Map<string, Promise<Object3D>>();

  let gltfLoader: GLTFLoader | null = null;
  let dracoLoader: DRACOLoader | null = null;

  const defaultLoadGltf = (
    url: string
  ): Promise<{ scene: Object3D; animations?: AnimationClip[] }> => {
    if (!gltfLoader) {
      // iOS 上停用 ImageBitmap，避免 Safari 17+ 貼圖全白（必須在 new GLTFLoader() 之前）
      disableImageBitmapForIOS();
      gltfLoader = new GLTFLoader();
      dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath(options.dracoDecoderPath ?? DEFAULT_DRACO_DECODER_PATH);
      gltfLoader.setDRACOLoader(dracoLoader);
      gltfLoader.setMeshoptDecoder(MeshoptDecoder);
    }
    return gltfLoader.loadAsync(url);
  };

  const loadGltf = options.loadGltf ?? defaultLoadGltf;

  return {
    load(key: string): Promise<Object3D> {
      const cached = cache.get(key);
      if (cached !== undefined) return cached;

      const entry = getManifestEntry(key);
      if (!entry) {
        return Promise.reject(new Error(`[island-engine] unknown asset key: ${key}`));
      }

      const promise = loadGltf(`${baseUrl}${entry.path}`)
        .then((gltf) => {
          const object = gltf.scene;
          object.name = entry.key;
          object.scale.setScalar(entry.scale);
          shadowify(object);
          // rigged 模型的動畫剪輯掛在 userData，供 AnimationMixer 使用
          object.userData.animations = gltf.animations ?? [];
          return object;
        })
        .catch((error: unknown) => {
          console.warn(`[island-engine] asset "${key}" 載入失敗，改用替代幾何體`, error);
          return buildFallbackObject(entry);
        });
      cache.set(key, promise);
      return promise;
    },
    dispose(): void {
      cache.clear();
      dracoLoader?.dispose();
      gltfLoader = null;
      dracoLoader = null;
    },
  };
};
