import { addDays, differenceInDays } from "date-fns";
import { calcEndDate } from "@/lib/practice-create";

/**
 * 實踐結束日：含頭尾共 durationDays 天（沿用建立流程的 calcEndDate），
 * 與 server practices.end_date 同一規則；共同挑戰複製出的實踐因此與挑戰結束日同一天（daodao#295）。
 */
export function practiceEndDate(start: Date, durationDays: number): Date {
  return calcEndDate(start, durationDays);
}

/**
 * 剩餘天數（不超過總天數、不小於 0）。
 * 以「結束日隔天 00:00」為界計算，數值與修正結束日前一致。
 */
export function practiceRemainingDays(start: Date, durationDays: number, today: Date): number {
  const dayAfterEnd = addDays(practiceEndDate(start, durationDays), 1);
  return Math.min(durationDays, Math.max(0, differenceInDays(dayAfterEnd, today)));
}
