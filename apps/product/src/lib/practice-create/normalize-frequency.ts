/** 每週頻率上限（天） */
export const FREQUENCY_MAX = 7;
/** 每週頻率下限（天） */
export const FREQUENCY_MIN = 1;

/** 波浪號、各式破折號、「至」「到」→ 半形連字號 */
const RANGE_SYMBOLS = /[～~–—−至到]/g;

function clamp(value: number): number {
  return Math.min(FREQUENCY_MAX, Math.max(FREQUENCY_MIN, value));
}

/** 依 FR-2.40 正規化自訂頻率字串（純函式）。無數字時回傳空字串。 */
export function normalizeFrequency(input: string): string {
  const cleaned = input
    .replace(RANGE_SYMBOLS, "-")
    .replace(/[^\d-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const segments = cleaned
    .split("-")
    .filter((segment) => segment.length > 0)
    .slice(0, 2)
    .map((segment) => clamp(Number.parseInt(segment, 10)));

  const [a, b] = segments;
  if (a === undefined) return "";
  if (b === undefined || a === b) return String(a);
  const [min, max] = a < b ? [a, b] : [b, a];
  return `${min}-${max}`;
}

/** 已正規化字串 → 數值區間；空字串回傳 null */
export function frequencyToRange(normalized: string): { min: number; max: number } | null {
  if (normalized === "") return null;
  const parts = normalized.split("-").map((part) => Number.parseInt(part, 10));
  const min = parts[0];
  const max = parts[1] ?? min;
  if (min === undefined || max === undefined || Number.isNaN(min) || Number.isNaN(max)) {
    return null;
  }
  return { min, max };
}
