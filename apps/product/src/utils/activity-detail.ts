import { format, isValid, parse } from "date-fns";

/** 地點列的呈現狀態：未設定一律 N/A；已設定時未加入者遮蔽、已加入者顯示。 */
export type ActivityLocationDisplay =
  | { kind: "na" }
  | { kind: "locked" }
  | { kind: "visible"; value: string };

export const resolveLocationDisplay = (
  location: string | null | undefined,
  isJoined: boolean
): ActivityLocationDisplay => {
  const value = location?.trim();
  if (!value) return { kind: "na" };
  return isJoined ? { kind: "visible", value } : { kind: "locked" };
};

/** 實踐數：沒有指派實踐為 N/A，否則「將進行 N 個實踐」。 */
export type ActivityPracticeDisplay = { kind: "na" } | { kind: "count"; count: number };

export const resolvePracticeDisplay = (
  count: number | null | undefined
): ActivityPracticeDisplay => (count && count > 0 ? { kind: "count", count } : { kind: "na" });

/** 以「yyyy/MM/dd」顯示日期；接受 ISO 日期時間字串（只取日曆日），無法解析時回傳原字串。 */
export const formatCalendarDate = (value: string): string => {
  const parsed = parse(value.slice(0, 10), "yyyy-MM-dd", new Date());
  return isValid(parsed) ? format(parsed, "yyyy/MM/dd") : value;
};

/** 活動期間：cohort 起訖日，詳情與加入頁共用。 */
export const formatActivityPeriod = (startDate: string, endDate: string): string =>
  `${formatCalendarDate(startDate)} – ${formatCalendarDate(endDate)}`;

/**
 * 以顯示用日期（yyyy/MM/dd，已換算到觀看者時區）取得星期索引：週日 0 … 週六 6。
 * 只看日曆日，不受瀏覽器時區影響；無法解析時回傳 null。
 */
export const weekdayIndexOf = (displayDate: string): number | null => {
  const parsed = parse(displayDate, "yyyy/MM/dd", new Date());
  return isValid(parsed) ? parsed.getDay() : null;
};
