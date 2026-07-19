/**
 * 佈局單元測試（tasks 3.6/3.7 驗收）：
 * - 實踐 → 建築映射規則
 * - 建築/植栽擺位 determinism
 * - 植栽種類數上限（draw call 個位數）與生態熱鬧度分級
 */

import { describe, expect, it } from "vitest";
import { generateTerrain, sampleTerrainHeight } from "../../terrain/generate";
import type { IIslandPractice } from "../../types";
import { BuildingKind, mapPracticeToBuilding } from "../index";
import {
  AMBIENT_CRITTER_COUNTS,
  computeBuildingPlacements,
  computeEcosystemLevel,
  computePlantPlacements,
  PLANT_SPECIES_COUNT,
} from "../layout";

const terrain = generateTerrain("layout-test-user", "D");

const practice = (id: string, status: "active" | "completed"): IIslandPractice => ({
  id,
  title: `實踐 ${id}`,
  status,
  themeColor: "#FF6B6B",
  checkinCount: 0,
  checkinIds: [],
});

describe("mapPracticeToBuilding（task 3.6 映射規則）", () => {
  it("active → 帳篷＋燃燒營火", () => {
    const spec = mapPracticeToBuilding(practice("p1", "active"));
    expect(spec.kind).toBe(BuildingKind.tent);
    expect(spec.campfireLit).toBe(true);
  });

  it("completed → 小木屋、無營火", () => {
    const spec = mapPracticeToBuilding(practice("p2", "completed"));
    expect(spec.kind).toBe(BuildingKind.cabin);
    expect(spec.campfireLit).toBe(false);
  });

  it("theme_color 傳遞到建築 spec", () => {
    expect(mapPracticeToBuilding(practice("p3", "active")).themeColor).toBe("#FF6B6B");
  });
});

describe("computeBuildingPlacements", () => {
  const practices = [
    practice("p-a", "active"),
    practice("p-b", "completed"),
    practice("p-c", "active"),
  ];

  it("同輸入輸出恆定（島主與訪客所見一致）", () => {
    const a = computeBuildingPlacements(terrain, practices);
    const b = computeBuildingPlacements(terrain, practices);
    expect(a).toEqual(b);
  });

  it("每個實踐一棟建築且都在陸地上", () => {
    const placements = computeBuildingPlacements(terrain, practices);
    expect(placements).toHaveLength(3);
    for (const placement of placements) {
      expect(sampleTerrainHeight(terrain, placement.x, placement.z)).toBeGreaterThan(0.2);
    }
  });

  it("建築彼此保持距離（不重疊）", () => {
    const placements = computeBuildingPlacements(terrain, practices);
    for (let i = 0; i < placements.length; i++) {
      for (let j = i + 1; j < placements.length; j++) {
        const a = placements[i];
        const b = placements[j];
        if (!a || !b) continue;
        expect(Math.hypot(a.x - b.x, a.z - b.z)).toBeGreaterThan(2);
      }
    }
  });
});

describe("computePlantPlacements（task 3.7）", () => {
  const building = { x: 4, z: 2 };
  const checkinIds = Array.from({ length: 12 }, (_, i) => 100 + i);

  it("每筆打卡一株植栽（12 筆 → 12 株）", () => {
    expect(computePlantPlacements(terrain, building, checkinIds)).toHaveLength(12);
  });

  it("位置與種類 deterministic（同 checkin id 恆定）", () => {
    const a = computePlantPlacements(terrain, building, checkinIds);
    const b = computePlantPlacements(terrain, building, checkinIds);
    expect(a).toEqual(b);
  });

  it("種類索引落在 InstancedMesh 種類數內（數百株 draw call 個位數）", () => {
    const manyIds = Array.from({ length: 300 }, (_, i) => i + 1);
    const placements = computePlantPlacements(terrain, building, manyIds);
    const speciesUsed = new Set(placements.map((p) => p.species));
    expect(speciesUsed.size).toBeLessThanOrEqual(PLANT_SPECIES_COUNT);
    expect(PLANT_SPECIES_COUNT).toBeLessThanOrEqual(9);
    for (const placement of placements) {
      expect(placement.species).toBeGreaterThanOrEqual(0);
      expect(placement.species).toBeLessThan(PLANT_SPECIES_COUNT);
    }
  });

  it("不同 checkin id 產生不同位置（種子生效）", () => {
    const placements = computePlantPlacements(terrain, building, [1, 2]);
    const first = placements[0];
    const second = placements[1];
    expect(first).toBeDefined();
    expect(second).toBeDefined();
    if (!first || !second) return;
    expect([first.x, first.z]).not.toEqual([second.x, second.z]);
  });
});

describe("computeEcosystemLevel（近 30 天打卡量 → 熱鬧度）", () => {
  it("分級門檻", () => {
    expect(computeEcosystemLevel(0)).toBe(0);
    expect(computeEcosystemLevel(3)).toBe(1);
    expect(computeEcosystemLevel(10)).toBe(2);
    expect(computeEcosystemLevel(30)).toBe(3);
  });

  it("熱鬧度只加不減：等級遞增、無負向視覺參數", () => {
    expect(AMBIENT_CRITTER_COUNTS[0]).toBe(0);
    expect(AMBIENT_CRITTER_COUNTS[1]).toBeLessThan(AMBIENT_CRITTER_COUNTS[2]);
    expect(AMBIENT_CRITTER_COUNTS[2]).toBeLessThan(AMBIENT_CRITTER_COUNTS[3]);
  });
});
