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
  palmTreeStraight: "palm-tree-straight",
  rock: "rock",
  grassPatch: "grass-patch",
  grassTuft: "grass-tuft",
  tree: "tree",
  treeOak: "tree-oak",
  bush: "bush",
  log: "log",
  flowerA: "flower-a",
  flowerB: "flower-b",
  flowerC: "flower-c",
  mushroom: "mushroom",
  chest: "chest",
  barrel: "barrel",
  crate: "crate",
  flag: "flag",
  dock: "dock",
  boat: "boat",
  animalBunny: "animal-bunny",
  animalBee: "animal-bee",
  animalChick: "animal-chick",
  animalCrab: "animal-crab",
  animalDeer: "animal-deer",
  animalFish: "animal-fish",
  animalFox: "animal-fox",
  animalParrot: "animal-parrot",
} as const;
export type IslandAssetKeyType = (typeof ISLAND_ASSETS)[keyof typeof ISLAND_ASSETS];

export const ISLAND_ASSET_MANIFEST: readonly IAssetManifestEntry[] = [
  {
    key: ISLAND_ASSETS.characterRoleD,
    path: "character-role-d.glb",
    scale: 0.65,
    fallback: { shape: FallbackShape.sphere, color: "#4AE8FF", size: [0.9, 0.9, 0.9] },
  },
  {
    key: ISLAND_ASSETS.tent,
    path: "tent.glb",
    scale: 3.6,
    fallback: { shape: FallbackShape.cone, color: "#FFA10E", size: [1.6, 1.4, 1.6] },
  },
  {
    key: ISLAND_ASSETS.cabin,
    path: "cabin.glb",
    scale: 1.5,
    fallback: { shape: FallbackShape.box, color: "#9A6948", size: [1.8, 1.5, 1.8] },
  },
  {
    key: ISLAND_ASSETS.campfireLit,
    path: "campfire-lit.glb",
    scale: 3.2,
    fallback: { shape: FallbackShape.cone, color: "#FF6E0B", size: [0.6, 0.7, 0.6] },
  },
  {
    key: ISLAND_ASSETS.campfireOut,
    path: "campfire-out.glb",
    scale: 3.2,
    fallback: { shape: FallbackShape.cylinder, color: "#536166", size: [0.6, 0.3, 0.6] },
  },
  {
    key: ISLAND_ASSETS.palmTree,
    path: "palm-tree.glb",
    scale: 0.75,
    fallback: { shape: FallbackShape.cylinder, color: "#79C99E", size: [0.5, 2.6, 0.5] },
  },
  {
    key: ISLAND_ASSETS.palmTreeStraight,
    path: "palm-tree-straight.glb",
    scale: 0.75,
    fallback: { shape: FallbackShape.cylinder, color: "#79C99E", size: [0.5, 2.6, 0.5] },
  },
  {
    key: ISLAND_ASSETS.rock,
    path: "rock.glb",
    scale: 0.38,
    fallback: { shape: FallbackShape.sphere, color: "#9FB5B8", size: [0.8, 0.6, 0.8] },
  },
  {
    key: ISLAND_ASSETS.grassPatch,
    path: "grass-patch.glb",
    scale: 1,
    fallback: { shape: FallbackShape.cone, color: "#79C99E", size: [0.4, 0.3, 0.4] },
  },
  // ---------- 環境擴充（nature/survival/pirate；scale 依實測高度校準） ----------
  {
    key: ISLAND_ASSETS.grassTuft,
    path: "grass-tuft.glb",
    scale: 2.8,
    fallback: { shape: FallbackShape.cone, color: "#79C99E", size: [0.3, 0.35, 0.3] },
  },
  {
    key: ISLAND_ASSETS.tree,
    path: "tree.glb",
    scale: 2,
    fallback: { shape: FallbackShape.cone, color: "#79C99E", size: [1.2, 3.2, 1.2] },
  },
  {
    key: ISLAND_ASSETS.treeOak,
    path: "tree-oak.glb",
    scale: 2.6,
    fallback: { shape: FallbackShape.cone, color: "#79C99E", size: [1.3, 3.2, 1.3] },
  },
  {
    key: ISLAND_ASSETS.bush,
    path: "bush.glb",
    scale: 2.2,
    fallback: { shape: FallbackShape.sphere, color: "#79C99E", size: [0.5, 0.5, 0.5] },
  },
  {
    key: ISLAND_ASSETS.log,
    path: "log.glb",
    scale: 2,
    fallback: { shape: FallbackShape.cylinder, color: "#8A5A44", size: [0.6, 0.3, 0.6] },
  },
  {
    key: ISLAND_ASSETS.flowerA,
    path: "flower-a.glb",
    scale: 2.2,
    fallback: { shape: FallbackShape.cone, color: "#C4B5FD", size: [0.2, 0.4, 0.2] },
  },
  {
    key: ISLAND_ASSETS.flowerB,
    path: "flower-b.glb",
    scale: 2.2,
    fallback: { shape: FallbackShape.cone, color: "#FCA5A5", size: [0.2, 0.4, 0.2] },
  },
  {
    key: ISLAND_ASSETS.flowerC,
    path: "flower-c.glb",
    scale: 2.2,
    fallback: { shape: FallbackShape.cone, color: "#FDE68A", size: [0.2, 0.4, 0.2] },
  },
  {
    key: ISLAND_ASSETS.mushroom,
    path: "mushroom.glb",
    scale: 2,
    fallback: { shape: FallbackShape.sphere, color: "#F87171", size: [0.3, 0.4, 0.3] },
  },
  // ---------- 營地道具與航線 ----------
  {
    key: ISLAND_ASSETS.chest,
    path: "chest.glb",
    scale: 0.55,
    fallback: { shape: FallbackShape.box, color: "#9A6948", size: [0.6, 0.6, 0.5] },
  },
  {
    key: ISLAND_ASSETS.barrel,
    path: "barrel.glb",
    scale: 0.65,
    fallback: { shape: FallbackShape.cylinder, color: "#9A6948", size: [0.5, 0.8, 0.5] },
  },
  {
    key: ISLAND_ASSETS.crate,
    path: "crate.glb",
    scale: 0.8,
    fallback: { shape: FallbackShape.box, color: "#B08968", size: [0.6, 0.6, 0.6] },
  },
  {
    key: ISLAND_ASSETS.flag,
    path: "flag.glb",
    scale: 1.25,
    fallback: { shape: FallbackShape.cylinder, color: "#536166", size: [0.1, 2.6, 0.1] },
  },
  {
    key: ISLAND_ASSETS.dock,
    path: "dock.glb",
    scale: 1.1,
    fallback: { shape: FallbackShape.box, color: "#B08968", size: [2.4, 0.4, 4.2] },
  },
  {
    key: ISLAND_ASSETS.boat,
    path: "boat.glb",
    scale: 1.4,
    fallback: { shape: FallbackShape.box, color: "#8A5A44", size: [1.2, 0.5, 2.6] },
  },
  {
    key: ISLAND_ASSETS.animalBunny,
    path: "animal-bunny.glb",
    scale: 0.72,
    fallback: { shape: FallbackShape.sphere, color: "#F5E7D3", size: [0.8, 1.1, 0.8] },
  },
  {
    key: ISLAND_ASSETS.animalBee,
    path: "animal-bee.glb",
    scale: 0.42,
    fallback: { shape: FallbackShape.sphere, color: "#F4C542", size: [0.5, 0.4, 0.5] },
  },
  {
    key: ISLAND_ASSETS.animalChick,
    path: "animal-chick.glb",
    scale: 0.55,
    fallback: { shape: FallbackShape.sphere, color: "#F5D86E", size: [0.6, 0.7, 0.6] },
  },
  {
    key: ISLAND_ASSETS.animalCrab,
    path: "animal-crab.glb",
    scale: 0.72,
    fallback: { shape: FallbackShape.sphere, color: "#EF765F", size: [0.8, 0.4, 0.8] },
  },
  {
    key: ISLAND_ASSETS.animalDeer,
    path: "animal-deer.glb",
    scale: 0.65,
    fallback: { shape: FallbackShape.sphere, color: "#B9825A", size: [0.9, 1.2, 0.9] },
  },
  {
    key: ISLAND_ASSETS.animalFish,
    path: "animal-fish.glb",
    scale: 0.55,
    fallback: { shape: FallbackShape.sphere, color: "#55B8D0", size: [0.8, 0.5, 0.5] },
  },
  {
    key: ISLAND_ASSETS.animalFox,
    path: "animal-fox.glb",
    scale: 0.72,
    fallback: { shape: FallbackShape.sphere, color: "#E98B4D", size: [0.9, 1, 0.9] },
  },
  {
    key: ISLAND_ASSETS.animalParrot,
    path: "animal-parrot.glb",
    scale: 0.58,
    fallback: { shape: FallbackShape.sphere, color: "#4DBA78", size: [0.7, 0.9, 0.7] },
  },
];

export const getManifestEntry = (key: string): IAssetManifestEntry | undefined =>
  ISLAND_ASSET_MANIFEST.find((entry) => entry.key === key);
