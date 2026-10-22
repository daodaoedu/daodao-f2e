import { describe, expect, it } from "vitest";
import {
  buildEditFrequencyPayload,
  deriveEditFrequency,
  resolveCustomFrequencyRange,
} from "../practice-edit-frequency";

describe("deriveEditFrequency", () => {
  it("7/7 → 每天、1/1 → 每週", () => {
    expect(deriveEditFrequency({ frequencyMinDays: 7, frequencyMaxDays: 7 })).toBe("daily");
    expect(deriveEditFrequency({ frequencyMinDays: 1, frequencyMaxDays: 1 })).toBe("weekly");
  });

  it("網頁建立的 2–4、4–7 天，或沒有頻率 → 自訂", () => {
    expect(deriveEditFrequency({ frequencyMinDays: 2, frequencyMaxDays: 4 })).toBe("custom");
    expect(deriveEditFrequency({ frequencyMinDays: 4, frequencyMaxDays: 7 })).toBe("custom");
    expect(deriveEditFrequency({})).toBe("custom");
  });
});

describe("buildEditFrequencyPayload", () => {
  // daodao#359：原本每週 2–4 天，App 存檔被改成 3–5 天
  it("原頻率 2/4 沒動頻率就存檔 → 不送頻率，server 保留 2/4", () => {
    const original = { frequencyMinDays: 2, frequencyMaxDays: 4 };
    expect(buildEditFrequencyPayload(deriveEditFrequency(original), original)).toEqual({});
  });

  it("原頻率 4/7、每天、每週沒動 → 都不送頻率", () => {
    for (const original of [
      { frequencyMinDays: 4, frequencyMaxDays: 7 },
      { frequencyMinDays: 7, frequencyMaxDays: 7 },
      { frequencyMinDays: 1, frequencyMaxDays: 1 },
    ]) {
      expect(buildEditFrequencyPayload(deriveEditFrequency(original), original)).toEqual({});
    }
  });

  it("改選每天／每週 → 送所選頻率", () => {
    const original = { frequencyMinDays: 2, frequencyMaxDays: 4 };
    expect(buildEditFrequencyPayload("daily", original)).toEqual({
      frequencyMinDays: 7,
      frequencyMaxDays: 7,
    });
    expect(buildEditFrequencyPayload("weekly", original)).toEqual({
      frequencyMinDays: 1,
      frequencyMaxDays: 1,
    });
  });

  it("從每天改選自訂 → 送自訂預設 3/5（App 目前沒有天數選擇）", () => {
    expect(
      buildEditFrequencyPayload("custom", { frequencyMinDays: 7, frequencyMaxDays: 7 })
    ).toEqual({ frequencyMinDays: 3, frequencyMaxDays: 5 });
  });

  it("原本沒有頻率、選自訂存檔 → 送畫面上顯示的預設 3/5", () => {
    expect(buildEditFrequencyPayload("custom", {})).toEqual({
      frequencyMinDays: 3,
      frequencyMaxDays: 5,
    });
    expect(
      buildEditFrequencyPayload("custom", { frequencyMinDays: null, frequencyMaxDays: null })
    ).toEqual({ frequencyMinDays: 3, frequencyMaxDays: 5 });
  });

  it("從 2/4 改選每天再改回自訂 → 回到原本 2/4，不送頻率", () => {
    const original = { frequencyMinDays: 2, frequencyMaxDays: 4 };
    expect(buildEditFrequencyPayload("custom", original)).toEqual({});
  });
});

describe("resolveCustomFrequencyRange", () => {
  it("原本就是自訂頻率 → 顯示原本的天數", () => {
    expect(resolveCustomFrequencyRange({ frequencyMinDays: 2, frequencyMaxDays: 4 })).toEqual({
      min: 2,
      max: 4,
    });
  });

  it("原本是每天／每週或沒有頻率 → 顯示自訂預設 3–5", () => {
    expect(resolveCustomFrequencyRange({ frequencyMinDays: 7, frequencyMaxDays: 7 })).toEqual({
      min: 3,
      max: 5,
    });
    expect(resolveCustomFrequencyRange({})).toEqual({ min: 3, max: 5 });
  });
});
