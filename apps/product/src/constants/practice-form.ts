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
  holiday: "holiday",
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
export const PracticeTimePeriodToExecutionTimingMap: Record<
  string,
  ExecutionTiming
> = {
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
export const DurationDaysNumberToStringMap: Record<
  DurationDaysNumber,
  DurationDays
> = {
  [DurationDaysNumber.seven]: DurationDays.seven,
  [DurationDaysNumber.fourteen]: DurationDays.fourteen,
  [DurationDaysNumber.twentyOne]: DurationDays.twentyOne,
  [DurationDaysNumber.thirty]: DurationDays.thirty,
} as const;
