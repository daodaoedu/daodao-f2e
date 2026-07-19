/**
 * Deterministic 亂數工具單元測試
 */

import { describe, expect, it } from "vitest";
import { createRandom, fbm2D, hashSeed, latticeValue, valueNoise2D } from "../random";

describe("hashSeed", () => {
  it("同字串同種子、異字串異種子", () => {
    expect(hashSeed("user-1")).toBe(hashSeed("user-1"));
    expect(hashSeed("user-1")).not.toBe(hashSeed("user-2"));
  });
});

describe("createRandom", () => {
  it("同種子輸出相同序列", () => {
    const a = createRandom(42);
    const b = createRandom(42);
    const seqA = Array.from({ length: 10 }, () => a());
    const seqB = Array.from({ length: 10 }, () => b());
    expect(seqA).toEqual(seqB);
  });

  it("輸出落在 [0, 1)", () => {
    const random = createRandom(7);
    for (let i = 0; i < 1000; i++) {
      const value = random();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe("latticeValue / valueNoise2D / fbm2D", () => {
  it("格點值不依賴呼叫順序", () => {
    const first = latticeValue(3, 7, 99);
    latticeValue(100, 200, 99);
    const second = latticeValue(3, 7, 99);
    expect(first).toBe(second);
  });

  it("噪聲在格點間連續內插且 deterministic", () => {
    expect(valueNoise2D(1.5, 2.5, 5)).toBe(valueNoise2D(1.5, 2.5, 5));
    expect(fbm2D(0.3, 0.9, 5)).toBe(fbm2D(0.3, 0.9, 5));
  });
});
