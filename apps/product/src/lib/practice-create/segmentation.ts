import { addDays } from "date-fns";
import { calcEndDate } from "./date-range";

/** 拆段段數下限 */
export const SEGMENT_COUNT_MIN = 2;
/** 拆段段數上限 */
export const SEGMENT_COUNT_MAX = 3;

/** 預設段數：min(3, max(2, ceil(天數 / 30))) */
export function defaultSegmentCount(totalDays: number): number {
  return Math.min(SEGMENT_COUNT_MAX, Math.max(SEGMENT_COUNT_MIN, Math.ceil(totalDays / 30)));
}

/** 天數平均分配，餘數依序給較前段 */
export function allocateSegmentDays(totalDays: number, segmentCount: number): number[] {
  if (segmentCount <= 0) return [];
  const base = Math.floor(totalDays / segmentCount);
  const remainder = totalDays % segmentCount;
  return Array.from({ length: segmentCount }, (_, index) => base + (index < remainder ? 1 : 0));
}

export interface DateRange {
  start: Date;
  end: Date;
}

/** 各段日期接續不重疊：後段自前段結束日隔日起 */
export function segmentDateRanges(startDate: Date, days: number[]): DateRange[] {
  const ranges: DateRange[] = [];
  let cursor = startDate;
  for (const segmentDays of days) {
    const end = calcEndDate(cursor, segmentDays);
    ranges.push({ start: cursor, end });
    cursor = addDays(end, 1);
  }
  return ranges;
}
