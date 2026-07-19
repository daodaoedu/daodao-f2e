/**
 * GLB 資產載入器（Draco ＋ Meshopt）
 *
 * 載入失敗（缺檔、網路錯誤、解碼失敗）一律回傳 manifest 定義的簡單幾何體，
 * 場景不因任何單一資產失敗而中斷（驗收 3.3：缺檔時場景仍完整可玩）。
 */

import {
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

export interface IAssetLoaderOptions {
  /** GLB 檔案的 base URL，預設 "/models/island/" */
  baseUrl?: string;
  dracoDecoderPath?: string;
  /** 測試注入點：覆寫實際的 GLTF 載入實作 */
  loadGltf?: (url: string) => Promise<{ scene: Object3D }>;
}

export interface IAssetLoader {
  /** 載入 manifest 內的資產；失敗回傳 fallback 幾何體（永不 reject） */
  load(key: string): Promise<Object3D>;
  dispose(): void;
}

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

  const defaultLoadGltf = (url: string): Promise<{ scene: Object3D }> => {
    if (!gltfLoader) {
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
      if (cached) return cached;

      const entry = getManifestEntry(key);
      if (!entry) {
        return Promise.reject(new Error(`[island-engine] unknown asset key: ${key}`));
      }

      const promise = loadGltf(`${baseUrl}${entry.path}`)
        .then((gltf) => {
          const object = gltf.scene;
          object.name = entry.key;
          object.scale.setScalar(entry.scale);
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
