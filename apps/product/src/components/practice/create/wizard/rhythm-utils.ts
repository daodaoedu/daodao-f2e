/**
 * Step 2（節奏設定）純函式：輸入清洗、夾限、預設值判斷、段落陣列調整
 */
import { ExecutionTiming } from "@/constants/practice-form";
import {
  DAYS_MAX,
  DAYS_MIN,
  DURATION_DAY_PRESETS,
  emptySegmentOverride,
  FREQUENCY_PRESETS,
  MINUTE_PRESETS,
  MINUTES_MAX,
  type SegmentOverride,
} from "./schema";

/** 逐段下拉「其他…」選項的 sentinel 值 */
export const SELECT_OTHER_VALUE = "__other__";

/** 執行時機 key → i18n label key */
export const TIMING_LABEL_KEYS = {
  [ExecutionTiming.morning]: "timing_morning",
  [ExecutionTiming.commute]: "timing_commute",
  [ExecutionTiming.lunchBreak]: "timing_lunch",
  [ExecutionTiming.evening]: "timing_evening",
  [ExecutionTiming.beforeSleep]: "timing_before_sleep",
} as const;

/** 僅保留數字並移除前導零（"007" → "7"、"0" → ""） */
export const sanitizeDigits = (raw: string, maxDigits?: number): string => {
  const digits = raw.replace(/\D/g, "").replace(/^0+/, "");
  return maxDigits === undefined ? digits : digits.slice(0, maxDigits);
};

/** 數字字串 → 夾限後整數；空字串回傳 null */
export const parseClampedInt = (digits: string, min: number, max: number): number | null => {
  if (digits === "") return null;
  const parsed = Number.parseInt(digits, 10);
  if (Number.isNaN(parsed)) return null;
  return Math.min(max, Math.max(min, parsed));
};

/** 自訂天數：僅數字、去前導零、> 90 靜默夾限為 90 */
export const sanitizeDaysInput = (raw: string): { text: string; value: number | null } => {
  const value = parseClampedInt(sanitizeDigits(raw), DAYS_MIN, DAYS_MAX);
  return { text: value === null ? "" : String(value), value };
};

/** 自訂分鐘：最多三位數、≤ 999 */
export const sanitizeMinutesInput = (raw: string): { text: string; value: number | null } => {
  const value = parseClampedInt(sanitizeDigits(raw, 3), 1, MINUTES_MAX);
  return { text: value === null ? "" : String(value), value };
};

/** 逐段頻率自訂框：僅接受數字與連字號 */
export const sanitizeFrequencyInput = (raw: string): string => raw.replace(/[^\d-]/g, "");

export const isDayPreset = (value: number | null): value is (typeof DURATION_DAY_PRESETS)[number] =>
  value !== null && (DURATION_DAY_PRESETS as readonly number[]).includes(value);

export const isMinutePreset = (value: number | null): value is (typeof MINUTE_PRESETS)[number] =>
  value !== null && (MINUTE_PRESETS as readonly number[]).includes(value);

export const isFrequencyPreset = (value: string): value is (typeof FREQUENCY_PRESETS)[number] =>
  (FREQUENCY_PRESETS as readonly string[]).includes(value);

/** 依段數調整陣列：保留既有 index 的覆寫，新段以空覆寫補上 */
export const resizeSegments = (segments: SegmentOverride[], count: number): SegmentOverride[] =>
  Array.from({ length: count }, (_, i) => segments[i] ?? emptySegmentOverride());

/** 建立 N 段全新的空覆寫（避免共用同一物件參照） */
export const createEmptySegments = (count: number): SegmentOverride[] =>
  Array.from({ length: count }, () => emptySegmentOverride());

/** 新增自訂時機：去空白、去重；無效時回傳原陣列 */
export const addCustomTiming = (list: string[], raw: string): string[] => {
  const value = raw.trim();
  if (value === "" || list.includes(value)) return list;
  return [...list, value];
};
