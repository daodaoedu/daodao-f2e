/**
 * 島嶼資產 manifest：GLB 檔案清單與載入失敗時的替代幾何體
 *
 * 正式素材於 task 5.2 入庫 `packages/assets/models/island/`；
 * 在那之前（或任何缺檔情境）以簡單幾何體替代，場景仍完整可玩（驗收 3.3）。
 */

export const FallbackShape = {
  box: "box",
  cone: "cone",
  cylinder: "cylinder",
  sphere: "sphere",
} as const;
export type FallbackShapeType = (typeof FallbackShape)[keyof typeof FallbackShape];

export interface IAssetManifestEntry {
  key: string;
  /** 相對於 assetBaseUrl 的路徑 */
  path: string;
  /** 以角色身高為基準的統一縮放（素材包各件比例不一，spike 教訓） */
  scale: number;
  fallback: {
    shape: FallbackShapeType;
    color: string;
    /** [寬, 高, 深]（sphere/cone/cylinder 取寬為直徑、高為高度） */
    size: [number, number, number];
  };
}

export const ISLAND_ASSETS = {
  characterRoleD: "character-role-d",
  tent: "tent",
  cabin: "cabin",
  campfireLit: "campfire-lit",
  campfireOut: "campfire-out",
  palmTree: "palm-tree",
  rock: "rock",
} as const;
export type IslandAssetKeyType = (typeof ISLAND_ASSETS)[keyof typeof ISLAND_ASSETS];

export const ISLAND_ASSET_MANIFEST: readonly IAssetManifestEntry[] = [
  {
    key: ISLAND_ASSETS.characterRoleD,
    path: "character-role-d.glb",
    scale: 1,
    fallback: { shape: FallbackShape.sphere, color: "#4AE8FF", size: [0.9, 0.9, 0.9] },
  },
  {
    key: ISLAND_ASSETS.tent,
    path: "tent.glb",
    scale: 1,
    fallback: { shape: FallbackShape.cone, color: "#FFA10E", size: [1.6, 1.4, 1.6] },
  },
  {
    key: ISLAND_ASSETS.cabin,
    path: "cabin.glb",
    scale: 1,
    fallback: { shape: FallbackShape.box, color: "#9A6948", size: [1.8, 1.5, 1.8] },
  },
  {
    key: ISLAND_ASSETS.campfireLit,
    path: "campfire-lit.glb",
    scale: 1,
    fallback: { shape: FallbackShape.cone, color: "#FF6E0B", size: [0.6, 0.7, 0.6] },
  },
  {
    key: ISLAND_ASSETS.campfireOut,
    path: "campfire-out.glb",
    scale: 1,
    fallback: { shape: FallbackShape.cylinder, color: "#536166", size: [0.6, 0.3, 0.6] },
  },
  {
    key: ISLAND_ASSETS.palmTree,
    path: "palm-tree.glb",
    scale: 1,
    fallback: { shape: FallbackShape.cylinder, color: "#79C99E", size: [0.5, 2.6, 0.5] },
  },
  {
    key: ISLAND_ASSETS.rock,
    path: "rock.glb",
    scale: 1,
    fallback: { shape: FallbackShape.sphere, color: "#9FB5B8", size: [0.8, 0.6, 0.8] },
  },
];

export const getManifestEntry = (key: string): IAssetManifestEntry | undefined =>
  ISLAND_ASSET_MANIFEST.find((entry) => entry.key === key);
