/**
 * 島上物件佈局（純函式，零 three.js 依賴，可單元測試）
 *
 * - 建築：實踐 → 環島營地帶的 deterministic 擺位（island seed ＋ practice id）
 * - 植栽：打卡 → 建築周圍的 deterministic 擺位（checkin id 為種子）
 * - 生態：近 30 天打卡量 → 熱鬧度等級
 */

import { createRandom, hashSeed } from "../core/random";
import { type ITerrainData, sampleTerrainHeight } from "../terrain/generate";
import type { IIslandPractice } from "../types";
import { type IBuildingSpec, mapPracticeToBuilding } from "./index";

export interface IBuildingPlacement extends IBuildingSpec {
  x: number;
  y: number;
  z: number;
  /** 面向島中心的朝向 */
  rotationY: number;
}

export interface IPlantPlacement {
  checkinId: number;
  /** 植栽種類索引 0..PLANT_SPECIES_COUNT-1 */
  species: number;
  x: number;
  y: number;
  z: number;
  scale: number;
  rotationY: number;
}

/** 植栽種類數：所有植栽以 InstancedMesh 分種類渲染，draw call = 種類數 */
export const PLANT_SPECIES_COUNT = 4;

/** 地形高度低於此值視為水線，不放物件 */
const LAND_HEIGHT = 0.25;

/**
 * 在指定半徑附近找一個在陸地上的落點：由外向內收，deterministic
 */
const settleOnLand = (
  terrain: ITerrainData,
  angle: number,
  preferredRadius: number
): { x: number; y: number; z: number } => {
  let radius = preferredRadius;
  for (let attempt = 0; attempt < 24; attempt++) {
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = sampleTerrainHeight(terrain, x, z);
    if (y > LAND_HEIGHT) return { x, y, z };
    radius *= 0.92;
  }
  return { x: 0, y: sampleTerrainHeight(terrain, 0, 0), z: 0 };
};

/**
 * 實踐 → 建築擺位：環島營地帶均分角度槽位＋practice id 抖動。
 * 同一 islandData 在任何裝置輸出恆定（spec「地形恆定」涵蓋建築與植栽配置）。
 */
export const computeBuildingPlacements = (
  terrain: ITerrainData,
  practices: IIslandPractice[]
): IBuildingPlacement[] => {
  const baseRandom = createRandom(terrain.seed ^ 0x5f3759df);
  const startAngle = baseRandom() * Math.PI * 2;
  const slotCount = Math.max(practices.length, 3);
  const campRadius = terrain.theme.islandRadius * 0.38;

  return practices.map((practice, index) => {
    const jitterRandom = createRandom(hashSeed(`building:${practice.id}`));
    const angle =
      startAngle +
      (index / slotCount) * Math.PI * 2 +
      (jitterRandom() - 0.5) * ((Math.PI * 2) / slotCount) * 0.4;
    const radius = campRadius * (0.8 + jitterRandom() * 0.35);
    const { x, y, z } = settleOnLand(terrain, angle, radius);
    return {
      ...mapPracticeToBuilding(practice),
      x,
      y,
      z,
      rotationY: Math.atan2(-z, -x) + Math.PI / 2,
    };
  });
};

/**
 * 打卡 → 植栽擺位：每筆打卡一株，種類/位置/大小全由 checkin id 種子決定
 */
export const computePlantPlacements = (
  terrain: ITerrainData,
  building: { x: number; z: number },
  checkinIds: number[]
): IPlantPlacement[] =>
  checkinIds.map((checkinId) => {
    const random = createRandom(hashSeed(`plant:${checkinId}`));
    const species = Math.floor(random() * PLANT_SPECIES_COUNT);
    const angle = random() * Math.PI * 2;
    const distance = 1.1 + random() * 1.6;
    let x = building.x + Math.cos(angle) * distance;
    let z = building.z + Math.sin(angle) * distance;
    // 落水則往建築收（deterministic，不重擲）
    for (let attempt = 0; attempt < 8; attempt++) {
      if (sampleTerrainHeight(terrain, x, z) > LAND_HEIGHT) break;
      x = building.x + (x - building.x) * 0.6;
      z = building.z + (z - building.z) * 0.6;
    }
    return {
      checkinId,
      species,
      x,
      y: sampleTerrainHeight(terrain, x, z),
      z,
      scale: 0.7 + random() * 0.5,
      rotationY: random() * Math.PI * 2,
    };
  });

/** 環境裝飾物件種類（值對齊資產 manifest key） */
export const EnvironmentKind = {
  palmTree: "palm-tree",
  palmTreeStraight: "palm-tree-straight",
  rock: "rock",
  tree: "tree",
  treeOak: "tree-oak",
  bush: "bush",
  grassTuft: "grass-tuft",
  flowerA: "flower-a",
  flowerB: "flower-b",
  flowerC: "flower-c",
  mushroom: "mushroom",
  log: "log",
  barrel: "barrel",
  crate: "crate",
  chest: "chest",
} as const;
export type EnvironmentKindType = (typeof EnvironmentKind)[keyof typeof EnvironmentKind];

export interface IEnvironmentPlacement {
  kind: EnvironmentKindType;
  x: number;
  y: number;
  z: number;
  scale: number;
  rotationY: number;
}

/**
 * 環境物件散佈（spec「地形主題……環境物件組合」）：
 * 棕櫚樹沿海灘帶、岩石散佈內陸，數量依主題 vegetationDensity，
 * 全部由島種子 deterministic 決定
 */
export const computeEnvironmentPlacements = (
  terrain: ITerrainData,
  avoid: readonly { x: number; z: number }[] = []
): IEnvironmentPlacement[] => {
  const random = createRandom(terrain.seed ^ 0x51ed270b);
  const radius = terrain.theme.islandRadius;
  const placements: IEnvironmentPlacement[] = [];
  const AVOID_RADIUS = 3.4;
  const isNearAvoid = (x: number, z: number): boolean =>
    avoid.some((point) => Math.hypot(point.x - x, point.z - z) < AVOID_RADIUS);

  const palmCount = Math.round(36 + terrain.theme.vegetationDensity * 48);
  for (let i = 0; i < palmCount; i++) {
    const angle = random() * Math.PI * 2;
    // 海灘帶：島緣內側；彎/直兩種棕櫚交錯
    const { x, y, z } = settleOnLand(terrain, angle, radius * (0.72 + random() * 0.2));
    const scale = 1 + random() * 0.5;
    const rotationY = random() * Math.PI * 2;
    const kind = random() < 0.5 ? EnvironmentKind.palmTree : EnvironmentKind.palmTreeStraight;
    if (isNearAvoid(x, z)) continue; // 避開營地（deterministic：不重擲）
    placements.push({ kind, x, y, z, scale, rotationY });
  }

  const rockCount = Math.round(30 + terrain.theme.coastRoughness * 28);
  for (let i = 0; i < rockCount; i++) {
    const angle = random() * Math.PI * 2;
    const { x, y, z } = settleOnLand(terrain, angle, radius * (0.3 + random() * 0.5));
    const scale = 0.9 + random() * 0.9;
    const rotationY = random() * Math.PI * 2;
    if (isNearAvoid(x, z)) continue;
    placements.push({ kind: EnvironmentKind.rock, x, y, z, scale, rotationY });
  }

  // 內陸樹林帶：闊葉樹兩種交錯
  const treeCount = Math.round(28 + terrain.theme.vegetationDensity * 44);
  for (let i = 0; i < treeCount; i++) {
    const angle = random() * Math.PI * 2;
    const { x, y, z } = settleOnLand(terrain, angle, radius * (0.3 + random() * 0.35));
    const scale = 1 + random() * 0.5;
    const rotationY = random() * Math.PI * 2;
    const kind = random() < 0.5 ? EnvironmentKind.tree : EnvironmentKind.treeOak;
    if (isNearAvoid(x, z)) continue;
    placements.push({ kind, x, y, z, scale, rotationY });
  }

  // 灌木與草叢：填滿中景層次
  const bushCount = Math.round(38 + terrain.theme.vegetationDensity * 64);
  for (let i = 0; i < bushCount; i++) {
    const angle = random() * Math.PI * 2;
    const { x, y, z } = settleOnLand(terrain, angle, radius * (0.25 + random() * 0.55));
    const scale = 0.9 + random() * 0.8;
    const rotationY = random() * Math.PI * 2;
    if (isNearAvoid(x, z)) continue;
    placements.push({ kind: EnvironmentKind.bush, x, y, z, scale, rotationY });
  }
  const tuftCount = Math.round(60 + terrain.theme.vegetationDensity * 80);
  for (let i = 0; i < tuftCount; i++) {
    const angle = random() * Math.PI * 2;
    const { x, y, z } = settleOnLand(terrain, angle, radius * (0.2 + random() * 0.65));
    const scale = 0.9 + random() * 0.8;
    const rotationY = random() * Math.PI * 2;
    if (isNearAvoid(x, z)) continue;
    placements.push({ kind: EnvironmentKind.grassTuft, x, y, z, scale, rotationY });
  }

  const wildKinds = [
    EnvironmentKind.flowerA,
    EnvironmentKind.flowerB,
    EnvironmentKind.flowerC,
    EnvironmentKind.mushroom,
  ] as const;
  const wildCount = Math.round(120 + terrain.theme.vegetationDensity * 160);
  for (let i = 0; i < wildCount; i++) {
    const angle = random() * Math.PI * 2;
    const { x, y, z } = settleOnLand(terrain, angle, radius * (0.15 + random() * 0.68));
    if (isNearAvoid(x, z)) continue;
    const kind = wildKinds[Math.floor(random() * wildKinds.length)];
    if (!kind) continue;
    placements.push({
      kind,
      x,
      y,
      z,
      scale: 0.65 + random() * 0.65,
      rotationY: random() * Math.PI * 2,
    });
  }

  const propKinds = [
    EnvironmentKind.log,
    EnvironmentKind.barrel,
    EnvironmentKind.crate,
    EnvironmentKind.chest,
  ] as const;
  for (let i = 0; i < 60; i++) {
    const angle = random() * Math.PI * 2;
    const { x, y, z } = settleOnLand(terrain, angle, radius * (0.2 + random() * 0.62));
    if (isNearAvoid(x, z)) continue;
    const kind = propKinds[Math.floor(random() * propKinds.length)];
    if (!kind) continue;
    placements.push({
      kind,
      x,
      y,
      z,
      scale: 0.8 + random() * 0.6,
      rotationY: random() * Math.PI * 2,
    });
  }

  return placements;
};

export interface IGrassPlacement {
  x: number;
  y: number;
  z: number;
  scale: number;
  rotationY: number;
}

/**
 * 草皮地毯（spike 視覺定案：patch-grass InstancedMesh 鋪滿島面）
 * 數量依主題 vegetationDensity；deterministic
 */
export const computeGrassPlacements = (
  terrain: ITerrainData,
  baseCount = 2600
): IGrassPlacement[] => {
  const random = createRandom(terrain.seed ^ 0x2545f491);
  const radius = terrain.theme.islandRadius;
  const count = Math.round(baseCount * (0.7 + terrain.theme.vegetationDensity * 0.6));
  const placements: IGrassPlacement[] = [];

  for (let i = 0; i < count; i++) {
    const angle = random() * Math.PI * 2;
    // sqrt 均勻分布在圓盤內，避開最外圈沙灘帶
    const r = Math.sqrt(random()) * radius * 0.82;
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    const scale = 0.4 + random() * 0.35;
    const rotationY = random() * Math.PI * 2;
    const y = sampleTerrainHeight(terrain, x, z);
    if (y <= LAND_HEIGHT) continue; // 落水跳過（deterministic：不重擲）
    placements.push({ x, y, z, scale, rotationY });
  }
  return placements;
};

/**
 * 空島營地（spec「空島狀態」）：沒有任何可渲染實踐時，
 * 島上仍有一頂帳篷＋熄滅營火。位置由島種子決定，不可點擊。
 */
export const computeEmptyCampPlacement = (terrain: ITerrainData): IBuildingPlacement => {
  const random = createRandom(terrain.seed ^ 0x9e3779b9);
  const angle = random() * Math.PI * 2;
  const { x, y, z } = settleOnLand(terrain, angle, terrain.theme.islandRadius * 0.22);
  return {
    practiceId: "",
    kind: "tent",
    themeColor: null,
    campfireLit: false,
    x,
    y,
    z,
    rotationY: Math.atan2(-z, -x) + Math.PI / 2,
  };
};

/** 生態熱鬧度等級（0–3）：近 30 天打卡總量分級；無壓力視覺——只加不減 */
export const computeEcosystemLevel = (recentCheckinCount: number): 0 | 1 | 2 | 3 => {
  if (recentCheckinCount <= 0) return 0;
  if (recentCheckinCount <= 5) return 1;
  if (recentCheckinCount <= 15) return 2;
  return 3;
};

/** 各熱鬧度等級的動物數量；空島也保留基本生態 */
export const AMBIENT_CRITTER_COUNTS: Record<0 | 1 | 2 | 3, number> = {
  0: 12,
  1: 14,
  2: 16,
  3: 18,
};
