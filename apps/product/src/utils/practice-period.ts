/**
 * 實踐期間計算統一來自 @daodao/shared（product 與 mobile 共用同一份規則，daodao#295）。
 * 範本庫、梯次指派的結束日也走同一份（daodao#277）。
 */
export {
  minEditableStartDate,
  parseLocalDate,
  practiceEndDate,
  practiceEndDateString,
  practiceRemainingDays,
  resolvePracticeDurationDays,
} from "@daodao/shared/lib/practice-period";
