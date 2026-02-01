/**
 * 實踐表單相關運行時常數
 */

/**
 * 執行時機運行時常數
 */
export const ExecutionTiming = {
  morning: "morning",
  lunchBreak: "lunchBreak",
  commute: "commute",
  evening: "evening",
  beforeSleep: "beforeSleep",
} as const;

/**
 * 執行時機類型
 */
export type ExecutionTiming = (typeof ExecutionTiming)[keyof typeof ExecutionTiming];

/**
 * 實踐頻率運行時常數
 */
export const Frequency = {
  twoToFour: "2-4",
  threeToFive: "3-5",
  fourToSeven: "4-7",
} as const;

/**
 * 實踐頻率類型
 */
export type Frequency = (typeof Frequency)[keyof typeof Frequency];

/**
 * 持續天數運行時常數（字串）
 */
export const DurationDays = {
  seven: "7",
  fourteen: "14",
  twentyOne: "21",
  thirty: "30",
} as const;

/**
 * 持續天數類型（字串）
 */
export type DurationDays = (typeof DurationDays)[keyof typeof DurationDays];

/**
 * 持續天數運行時常數（數字）
 */
export const DurationDaysNumber = {
  seven: 7,
  fourteen: 14,
  twentyOne: 21,
  thirty: 30,
} as const;

/**
 * 持續天數類型（數字）
 */
export type DurationDaysNumber = (typeof DurationDaysNumber)[keyof typeof DurationDaysNumber];

/**
 * API 的 practiceTimePeriods 映射到 executionTiming
 */
export const PracticeTimePeriodToExecutionTimingMap: Record<string, ExecutionTiming> = {
  morning: ExecutionTiming.morning,
  afternoon: ExecutionTiming.lunchBreak,
  evening: ExecutionTiming.evening,
  night: ExecutionTiming.beforeSleep,
} as const;

/**
 * 持續天數選項陣列（數字）
 */
export const DURATION_DAYS_NUMBER_OPTIONS: DurationDaysNumber[] = [
  DurationDaysNumber.seven,
  DurationDaysNumber.fourteen,
  DurationDaysNumber.twentyOne,
  DurationDaysNumber.thirty,
];

/**
 * 持續天數數字到字串的映射
 */
export const DurationDaysNumberToStringMap: Record<DurationDaysNumber, DurationDays> = {
  [DurationDaysNumber.seven]: DurationDays.seven,
  [DurationDaysNumber.fourteen]: DurationDays.fourteen,
  [DurationDaysNumber.twentyOne]: DurationDays.twentyOne,
  [DurationDaysNumber.thirty]: DurationDays.thirty,
} as const;

/**
 * ExecutionTiming 映射到 API 的 practiceTimePeriods
 */
export const ExecutionTimingToPracticeTimePeriodMap: Record<
  ExecutionTiming,
  ("morning" | "afternoon" | "evening" | "night" | "commute")
> = {
  [ExecutionTiming.morning]: "morning",
  [ExecutionTiming.lunchBreak]: "afternoon",
  [ExecutionTiming.commute]: "commute",
  [ExecutionTiming.evening]: "evening",
  [ExecutionTiming.beforeSleep]: "night",
} as const;

/**
 * 將表單的 executionTiming 轉換成 API 的 practiceTimePeriods
 */
export const mapExecutionTimingToPracticeTimePeriods = (
  executionTiming: ExecutionTiming[]
): ("morning" | "afternoon" | "evening" | "night")[] => {
  return executionTiming
    .map((timing) => ExecutionTimingToPracticeTimePeriodMap[timing])
    .filter((period): period is "morning" | "afternoon" | "evening" | "night" => period !== null);
};

/**
 * 將表單的 frequency 轉換成 frequencyMinDays 和 frequencyMaxDays
 */
export const parseFrequency = (frequency: Frequency): { minDays: number; maxDays: number } => {
  const parts = frequency.split("-");
  const minStr = parts[0];
  const maxStr = parts[1];
  const min = minStr ? Number.parseInt(minStr, 10) : 3;
  const max = maxStr ? Number.parseInt(maxStr, 10) : 5;
  return { minDays: min, maxDays: max };
};

/**
 * 實踐標籤最大數量限制
 */
export const MAX_PRACTICE_TAGS = 10;
