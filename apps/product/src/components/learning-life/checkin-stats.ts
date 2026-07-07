import { differenceInCalendarDays, format, parseISO, subDays } from "date-fns";
import type { ElementType } from "react";
import { CHECKIN_MOOD_META } from "./constants";
import type { CheckinMood, MockCheckin } from "./types";

/** 有打卡的日期集合（yyyy-MM-dd） */
export function getCheckinDates(checkins: MockCheckin[]): Set<string> {
  return new Set(checkins.map((c) => c.checkinDate));
}

/** 連續打卡天數：從 today 往回連續計；today 未打卡則從昨天起算 */
export function getCheckinStreak(checkins: MockCheckin[], today: string): number {
  const dates = getCheckinDates(checkins);
  let cursor = parseISO(today);
  if (!dates.has(format(cursor, "yyyy-MM-dd"))) cursor = subDays(cursor, 1);
  let streak = 0;
  while (dates.has(format(cursor, "yyyy-MM-dd"))) {
    streak += 1;
    cursor = subDays(cursor, 1);
  }
  return streak;
}

/** 距最近一次打卡的天數；0=今天已打卡；沒有任何打卡回傳 Infinity */
export function getDaysSinceLastCheckin(checkins: MockCheckin[], today: string): number {
  let latest: string | null = null;
  for (const c of checkins) {
    if (!latest || c.checkinDate > latest) latest = c.checkinDate;
  }
  if (!latest) return Number.POSITIVE_INFINITY;
  return Math.max(0, differenceInCalendarDays(parseISO(today), parseISO(latest)));
}

export interface DailyCheckinCount {
  date: string;
  count: number;
}

/** 近 days 天（含 today，由舊到新）每天的打卡數 */
export function getDailyCheckinCounts(
  checkins: MockCheckin[],
  today: string,
  days: number
): DailyCheckinCount[] {
  const counts = new Map<string, number>();
  for (const c of checkins) counts.set(c.checkinDate, (counts.get(c.checkinDate) ?? 0) + 1);
  const result: DailyCheckinCount[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = format(subDays(parseISO(today), i), "yyyy-MM-dd");
    result.push({ date, count: counts.get(date) ?? 0 });
  }
  return result;
}

export interface WeeklySummary {
  thisWeekDays: number;
  lastWeekDays: number;
  last7: DailyCheckinCount[];
  sentence: string;
}

/** 本週摘要：近 7 天 vs 前 7 天的打卡天數比較，產生一句話結論 */
export function getWeeklySummary(checkins: MockCheckin[], today: string): WeeklySummary {
  const last14 = getDailyCheckinCounts(checkins, today, 14);
  const lastWeek = last14.slice(0, 7);
  const thisWeek = last14.slice(7);
  const thisWeekDays = thisWeek.filter((d) => d.count > 0).length;
  const lastWeekDays = lastWeek.filter((d) => d.count > 0).length;
  const diff = thisWeekDays - lastWeekDays;
  // 下滑不做負向比較（「比上週少 X 天」），改給體諒句——中斷後回來的人最需要被接住
  let comparison = "跟上週一樣";
  if (diff > 0) comparison = `比上週多 ${diff} 天`;
  if (diff < 0) comparison = "節奏放慢了些，也沒關係";
  return {
    thisWeekDays,
    lastWeekDays,
    last7: thisWeek,
    sentence: `這 7 天你打卡了 ${thisWeekDays} 天，${comparison}`,
  };
}

export interface MoodDistributionItem {
  mood: CheckinMood;
  icon: ElementType;
  label: string;
  count: number;
}

/**
 * 近 days 天各心情的出現次數（依 CHECKIN_MOOD_META 順序）。
 * 刻意用分佈而非平均折線：心情是認識自己的訊號，不是越高越好的分數，
 * 挫折常是突破的前奏，不應被呈現為「低谷」。
 */
export function getMoodDistribution(
  checkins: MockCheckin[],
  today: string,
  days: number
): MoodDistributionItem[] {
  const start = format(subDays(parseISO(today), days - 1), "yyyy-MM-dd");
  const counts = new Map<CheckinMood, number>();
  for (const c of checkins) {
    if (c.checkinDate >= start && c.checkinDate <= today) {
      counts.set(c.mood, (counts.get(c.mood) ?? 0) + 1);
    }
  }
  return (Object.keys(CHECKIN_MOOD_META) as CheckinMood[]).map((mood) => ({
    mood,
    icon: CHECKIN_MOOD_META[mood].icon,
    label: CHECKIN_MOOD_META[mood].label,
    count: counts.get(mood) ?? 0,
  }));
}
