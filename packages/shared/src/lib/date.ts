import { differenceInDays, differenceInHours, differenceInMinutes } from "date-fns";

type TimeDifferenceResult =
  | { value: number; unit: "days" }
  | { value: number; unit: "hours" }
  | { value: number; unit: "minutes" }
  | { value: 0; unit: "just_now" };

/**
 * 計算時間差，返回結構化的時間差數據
 * 不包含多語系文字，適合在需要多語系的場景中使用
 *
 * @param date 目標日期
 */
export function calculateTimeDifference(date?: string | Date): TimeDifferenceResult {
  const targetDate = date ?? new Date();
  const currentDate = new Date();
  const publishedDate = new Date(targetDate);
  const diffDay = differenceInDays(currentDate, publishedDate);
  const diffHour = differenceInHours(currentDate, publishedDate);
  const diffMinute = differenceInMinutes(currentDate, publishedDate);

  if (diffDay > 0) {
    return { value: diffDay, unit: "days" as const };
  }
  if (diffHour < 24 && diffHour > 0) {
    return { value: diffHour, unit: "hours" as const };
  }
  if (diffMinute < 60 && diffMinute > 0) {
    return { value: diffMinute, unit: "minutes" as const };
  }
  return { value: 0, unit: "just_now" as const };
}
