import {
  type ExecutionTiming,
  mapExecutionTimingToPracticeTimePeriods,
  PracticeTimePeriodToExecutionTimingMap,
} from "@/constants/practice-form";
import { frequencyToRange, normalizeFrequency } from "@/lib/practice-create";

/**
 * 網頁編輯／詳情頁的節奏欄位（天數、頻率、每次時間、執行時機）。
 *
 * 新建立流程（daodao#141）可存任意天數、每週 1–7 天區間、任意分鐘；舊編輯頁只認預設值，
 * 其他值一律顯示成 7 天、2–4，存檔再把錯的預設值送出（daodao#370）。
 * 做法同 App 端 daodao#359：表單照原值帶入，存檔只送有改的欄位，server 只更新有送的欄位。
 */

export interface PracticeScheduleSource {
  durationDays?: number | null;
  frequencyMinDays?: number | null;
  frequencyMaxDays?: number | null;
  sessionDurationMinutes?: number | null;
  practiceTimePeriods?: string[] | null;
  otherContext?: string | null;
}

export interface EditScheduleValues {
  /** 數字字串；"" = 沒有值 */
  durationDays: string;
  /** 正規化頻率（"1-3"、"7"）；"" = 沒有值 */
  frequency: string;
  durationMinutes: number | null;
  executionTiming: ExecutionTiming[];
  customTiming: string;
}

export interface ScheduleUpdatePayload {
  durationDays?: number;
  frequencyMinDays?: number;
  frequencyMaxDays?: number;
  sessionDurationMinutes?: number;
  practiceTimePeriods?: ReturnType<typeof mapExecutionTimingToPracticeTimePeriods>;
  otherContext?: string;
}

/** 每週頻率顯示字串：區間 "1-3"、單一值 "7"；缺值回傳 ""，不捏造預設 */
export const formatFrequencyRange = (
  min: number | null | undefined,
  max: number | null | undefined
): string => {
  if (min == null || max == null) return "";
  return normalizeFrequency(`${min}-${max}`);
};

const toExecutionTimings = (periods: string[] | null | undefined): ExecutionTiming[] =>
  (periods ?? [])
    .map((period) => PracticeTimePeriodToExecutionTimingMap[period])
    .filter((timing): timing is ExecutionTiming => timing !== undefined);

/** API 實踐 → 編輯表單的節奏欄位（原值帶入，缺值留空） */
export const toEditScheduleValues = (data: PracticeScheduleSource): EditScheduleValues => ({
  durationDays: data.durationDays ? String(data.durationDays) : "",
  frequency: formatFrequencyRange(data.frequencyMinDays, data.frequencyMaxDays),
  durationMinutes: data.sessionDurationMinutes ?? null,
  executionTiming: toExecutionTimings(data.practiceTimePeriods),
  customTiming: data.otherContext ?? "",
});

const sameSet = (a: readonly string[], b: readonly string[]): boolean => {
  const left = new Set(a);
  const right = new Set(b);
  return left.size === right.size && [...left].every((value) => right.has(value));
};

/** 存檔時的節奏欄位：和原值相同就不送，避免把原本的值蓋掉 */
export const buildScheduleUpdatePayload = (
  values: EditScheduleValues,
  original: PracticeScheduleSource
): ScheduleUpdatePayload => {
  const before = toEditScheduleValues(original);
  const payload: ScheduleUpdatePayload = {};

  const days = Number.parseInt(values.durationDays, 10);
  if (values.durationDays !== before.durationDays && !Number.isNaN(days)) {
    payload.durationDays = days;
  }

  const frequency = normalizeFrequency(values.frequency);
  const range = frequencyToRange(frequency);
  if (frequency !== before.frequency && range) {
    payload.frequencyMinDays = range.min;
    payload.frequencyMaxDays = range.max;
  }

  if (values.durationMinutes != null && values.durationMinutes !== before.durationMinutes) {
    payload.sessionDurationMinutes = values.durationMinutes;
  }

  if (!sameSet(values.executionTiming, before.executionTiming)) {
    payload.practiceTimePeriods = mapExecutionTimingToPracticeTimePeriods(values.executionTiming);
  }

  if (values.customTiming !== before.customTiming) {
    payload.otherContext = values.customTiming;
  }

  return payload;
};
