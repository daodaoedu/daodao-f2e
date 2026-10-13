import { format, isSameYear } from "date-fns";
import { practiceEndDate } from "@/utils/practice-period";

/** 結束日 = 開始日 + 天數 − 1（首日計入）；與範本庫、學員實踐頁同一份規則（daodao#277） */
export const calcEndDate = practiceEndDate;

/**
 * 區間文字：YYYY/MM/DD – YYYY/MM/DD；
 * 同年時第二個日期省略年份（2026/08/20 – 08/26）。
 */
export function formatDateRange(start: Date, end: Date): string {
  const sameYear = isSameYear(start, end);
  const endFormat = sameYear ? "MM/dd" : "yyyy/MM/dd";
  return `${format(start, "yyyy/MM/dd")} – ${format(end, endFormat)}`;
}
