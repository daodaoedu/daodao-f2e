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
  const campRadius = terrain.theme.islandRadius * 0.55;

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

/** 生態熱鬧度等級（0–3）：近 30 天打卡總量分級；無壓力視覺——只加不減 */
export const computeEcosystemLevel = (recentCheckinCount: number): 0 | 1 | 2 | 3 => {
  if (recentCheckinCount <= 0) return 0;
  if (recentCheckinCount <= 5) return 1;
  if (recentCheckinCount <= 15) return 2;
  return 3;
};

/** 各熱鬧度等級的氛圍粒子/小動物數量 */
export const AMBIENT_CRITTER_COUNTS: Record<0 | 1 | 2 | 3, number> = {
  0: 0,
  1: 4,
  2: 8,
  3: 14,
};
