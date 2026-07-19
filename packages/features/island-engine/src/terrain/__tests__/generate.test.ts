/**
 * 地形生成單元測試（task 3.2 驗收）：
 * - 同種子輸出恆定
 * - 五套人格主題參數各異 ＋ 中性預設
 */

import { describe, expect, it } from "vitest";
import { PersonaType } from "../../types";
import {
  flattenTerrainAround,
  generateTerrain,
  sampleTerrainHeight,
  terrainHeightAt,
} from "../generate";
import { getTerrainTheme, NEUTRAL_THEME, TERRAIN_THEMES } from "../themes";

describe("generateTerrain determinism", () => {
  it("同種子＋同人格輸出完全一致", () => {
    const a = generateTerrain("user-external-id-123", PersonaType.D);
    const b = generateTerrain("user-external-id-123", PersonaType.D);
    expect(a.seed).toBe(b.seed);
    expect(a.size).toBe(b.size);
    expect(Array.from(a.heights)).toEqual(Array.from(b.heights));
  });

  it("不同種子輸出不同高度場", () => {
    const a = generateTerrain("user-aaa", PersonaType.D);
    const b = generateTerrain("user-bbb", PersonaType.D);
    expect(Array.from(a.heights)).not.toEqual(Array.from(b.heights));
  });

  it("terrainHeightAt 為純函式：同參數重複呼叫結果恆定", () => {
    const theme = getTerrainTheme(PersonaType.O);
    const first = terrainHeightAt(3.2, -4.1, 42, theme);
    const second = terrainHeightAt(3.2, -4.1, 42, theme);
    expect(first).toBe(second);
  });

  it("島中心在海面上、遠處在海面下", () => {
    const data = generateTerrain("center-test", PersonaType.C);
    expect(sampleTerrainHeight(data, 0, 0)).toBeGreaterThan(0);
    const edge = data.size / 2;
    expect(sampleTerrainHeight(data, edge, edge)).toBeLessThan(0);
  });
});

describe("flattenTerrainAround（整地）", () => {
  it("整地後點位周圍高度趨於一致且 deterministic", () => {
    const a = generateTerrain("flatten-test", PersonaType.A);
    const b = generateTerrain("flatten-test", PersonaType.A);
    const spot = { x: 3, z: 2 };
    flattenTerrainAround(a, [spot]);
    flattenTerrainAround(b, [spot]);
    expect(Array.from(a.heights)).toEqual(Array.from(b.heights));

    const center = sampleTerrainHeight(a, spot.x, spot.z);
    // 點位半徑內高度差收斂
    for (const [dx, dz] of [
      [0.8, 0],
      [-0.8, 0.5],
      [0, -0.9],
    ] as const) {
      expect(Math.abs(sampleTerrainHeight(a, spot.x + dx, spot.z + dz) - center)).toBeLessThan(
        0.25
      );
    }
  });
});

describe("terrain themes", () => {
  const personaKeys = Object.values(PersonaType);

  it("五種人格各有主題，參數兩兩相異", () => {
    expect(personaKeys).toHaveLength(5);
    const themes = personaKeys.map((key) => getTerrainTheme(key));
    for (let i = 0; i < themes.length; i++) {
      for (let j = i + 1; j < themes.length; j++) {
        const a = themes[i];
        const b = themes[j];
        expect(a).toBeDefined();
        expect(b).toBeDefined();
        if (!a || !b) continue;
        // 生成參數組合不可完全相同（驗收：五主題參數各異）
        const paramsA = [
          a.islandRadius,
          a.hillAmplitude,
          a.noiseFrequency,
          a.coastRoughness,
          a.vegetationDensity,
        ];
        const paramsB = [
          b.islandRadius,
          b.hillAmplitude,
          b.noiseFrequency,
          b.coastRoughness,
          b.vegetationDensity,
        ];
        expect(paramsA).not.toEqual(paramsB);
        // 配色也不可相同
        expect([a.grass, a.cliff, a.accent]).not.toEqual([b.grass, b.cliff, b.accent]);
      }
    }
  });

  it("同一人格在不同主題下高度場相異（主題參數確實影響生成）", () => {
    const d = generateTerrain("same-user", PersonaType.D);
    const o = generateTerrain("same-user", PersonaType.O);
    expect(Array.from(d.heights)).not.toEqual(Array.from(o.heights));
  });

  it("未完成 quiz（null）與未知代碼回傳中性預設", () => {
    expect(getTerrainTheme(null)).toBe(NEUTRAL_THEME);
    expect(getTerrainTheme("X")).toBe(NEUTRAL_THEME);
  });

  it("小寫人格代碼容錯", () => {
    expect(getTerrainTheme("d")).toBe(TERRAIN_THEMES.get("D"));
  });
});
