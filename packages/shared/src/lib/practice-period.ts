import { addDays, differenceInCalendarDays } from "date-fns";

// 整串錨定：只接受 YYYY-MM-DD，或後面緊接 T 開頭的 ISO 時間；其他尾巴（"2026-10-09abc"）視為格式錯誤
const DATE_ONLY_RE = /^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/;

/**
 * 把 API 的日期字串（YYYY-MM-DD，或帶時間的 ISO 字串只取日期部分）解析成「當地日曆日」的午夜。
 * 不可用 new Date("YYYY-MM-DD")：那是 UTC 午夜，負時差時區會變成前一天（daodao#295）。
 */
export function parseLocalDate(value: string): Date | null {
  const match = DATE_ONLY_RE.exec(value);
  if (!match) return null;
  const [, y, m, d] = match;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  // 2026-02-30 這類不存在的日期會被 Date 進位成下個月，視為無效
  if (
    date.getFullYear() !== Number(y) ||
    date.getMonth() !== Number(m) - 1 ||
    date.getDate() !== Number(d)
  ) {
    return null;
  }
  return date;
}

/**
 * 實踐結束日：含頭尾共 durationDays 天，結束日 = 開始日 + 天數 − 1。
 * 與 server practices.end_date 同一規則；product 與 mobile 共用（daodao#295）。
 */
export function practiceEndDate(start: Date, durationDays: number): Date {
  return addDays(start, durationDays - 1);
}

/**
 * 實踐天數以 API 為準：durationDays 是正整數就照用，不限 7／14／21／30（那只是建立流程的選項）。
 * 從共同挑戰複製出的實踐天數跟著挑戰起訖日，可以是任何天數（daodao#299）。
 * 沒有 durationDays 時由起訖日（含頭尾）推回；都無法判斷回傳 null，不捏造預設天數。
 */
export function resolvePracticeDurationDays(practice: {
  durationDays?: number | null;
  startDate?: string | null;
  endDate?: string | null;
}): number | null {
  const { durationDays, startDate, endDate } = practice;
  if (typeof durationDays === "number" && Number.isInteger(durationDays) && durationDays >= 1) {
    return durationDays;
  }
  const start = startDate ? parseLocalDate(startDate) : null;
  const end = endDate ? parseLocalDate(endDate) : null;
  if (!start || !end) return null;
  const days = differenceInCalendarDays(end, start) + 1;
  return days >= 1 ? days : null;
}

/**
 * 剩餘天數：今天到結束日（含頭尾）的日曆日數，限制在 0～總天數。
 * 開始日當天 = 總天數、結束日當天 = 1、結束後 = 0；以日曆日計算，不受當下幾點影響。
 */
export function practiceRemainingDays(start: Date, durationDays: number, today: Date): number {
  const remaining = differenceInCalendarDays(practiceEndDate(start, durationDays), today) + 1;
  return Math.min(durationDays, Math.max(0, remaining));
}
