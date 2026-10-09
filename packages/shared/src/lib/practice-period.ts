import { addDays } from "date-fns";

/**
 * 實踐結束日：含頭尾共 durationDays 天，結束日 = 開始日 + 天數 − 1。
 * 與 server practices.end_date 及 product 的 calcEndDate 同一規則（daodao#295）。
 */
export function practiceEndDate(start: Date, durationDays: number): Date {
  return addDays(start, durationDays - 1);
}
