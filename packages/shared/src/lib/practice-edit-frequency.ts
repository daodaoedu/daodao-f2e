/**
 * App 編輯實踐頁的頻率選項：每天（每週 7 天）、每週（每週 1 天）、自訂。
 *
 * App 的「自訂」沒有天數選擇，網頁建立的每週 2–4、4–7 天等頻率都會落在「自訂」。
 * 使用者沒動頻率時不送頻率欄位，server 只更新有送的欄位，原值就不會被蓋掉（daodao#359）。
 */
export type EditFrequencyOption = "daily" | "weekly" | "custom";

export interface PracticeFrequencyRange {
  frequencyMinDays?: number | null;
  frequencyMaxDays?: number | null;
}

/** App 改選「自訂」時送出的預設天數（App 目前沒有天數選擇；選項設計待產品決定） */
const DEFAULT_CUSTOM_RANGE = { min: 3, max: 5 } as const;

export const deriveEditFrequency = (range: PracticeFrequencyRange): EditFrequencyOption => {
  if (range.frequencyMinDays === 7 && range.frequencyMaxDays === 7) return "daily";
  if (range.frequencyMinDays === 1 && range.frequencyMaxDays === 1) return "weekly";
  return "custom";
};

/** 「自訂」實際代表的天數：原本就是自訂頻率時沿用原值，否則為預設 3–5 天 */
export const resolveCustomFrequencyRange = (
  original: PracticeFrequencyRange
): { min: number; max: number } => {
  const { frequencyMinDays: min, frequencyMaxDays: max } = original;
  if (deriveEditFrequency(original) === "custom" && min != null && max != null) {
    return { min, max };
  }
  return { ...DEFAULT_CUSTOM_RANGE };
};

/**
 * 存檔時的頻率欄位：選項沒變就不送（保留原值），改選才送所選頻率。
 * 原本沒有頻率時，「自訂」送畫面上顯示的預設 3–5 天，不是空著。
 */
export const buildEditFrequencyPayload = (
  selected: EditFrequencyOption,
  original: PracticeFrequencyRange
): { frequencyMinDays?: number; frequencyMaxDays?: number } => {
  const hasOriginalRange = original.frequencyMinDays != null && original.frequencyMaxDays != null;
  if (selected === deriveEditFrequency(original) && hasOriginalRange) return {};
  if (selected === "daily") return { frequencyMinDays: 7, frequencyMaxDays: 7 };
  if (selected === "weekly") return { frequencyMinDays: 1, frequencyMaxDays: 1 };
  const { min, max } = resolveCustomFrequencyRange(original);
  return { frequencyMinDays: min, frequencyMaxDays: max };
};
