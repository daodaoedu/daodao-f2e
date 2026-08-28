import { addDays, format } from "date-fns";

/** 結束日 = 開始日 + 天數 − 1（首日計入） */
export function calcEndDate(startDate: Date, durationDays: number): Date {
  return addDays(startDate, durationDays - 1);
}

/**
 * 區間文字：YYYY/MM/DD – YYYY/MM/DD；
 * 同年時第二個日期省略年份（2026/08/20 – 08/26）。
 */
export function formatDateRange(start: Date, end: Date): string {
  const sameYear = start.getFullYear() === end.getFullYear();
  const endFormat = sameYear ? "MM/dd" : "yyyy/MM/dd";
  return `${format(start, "yyyy/MM/dd")} – ${format(end, endFormat)}`;
}
