"use client";

import { format, parseISO } from "date-fns";
import { useMemo } from "react";
import { CHECKIN_MOOD_META } from "../constants";
import { MOCK_PRACTICES } from "../mock-data";
import type { CheckinMood, MockCheckin } from "../types";

const MOOD_GRADIENT_COLOR: Record<CheckinMood, string> = {
  give_up: "#94A3B8",
  frustrated: "#FB7185",
  bored: "#FBBF24",
  neutral: "#60A5FA",
  good: "#34D399",
  happy: "#F472B6",
};

const MONTH_LABELS = Array.from({ length: 12 }, (_, i) => i + 1);

function monthlyActiveDays(checkins: MockCheckin[], year: number): number[] {
  const counts = new Array(12).fill(0);
  const days = new Set<string>();
  for (const c of checkins) {
    const [y, m] = c.checkinDate.split("-");
    if (Number(y) !== year) continue;
    const key = c.checkinDate;
    if (days.has(key)) continue;
    days.add(key);
    const monthIdx = Number(m) - 1;
    if (monthIdx >= 0 && monthIdx < 12) counts[monthIdx] += 1;
  }
  return counts;
}

function dominantMoodByMonth(checkins: MockCheckin[], year: number): (CheckinMood | null)[] {
  const buckets: CheckinMood[][] = Array.from({ length: 12 }, () => []);
  for (const c of checkins) {
    const [y, m] = c.checkinDate.split("-");
    if (Number(y) !== year) continue;
    const monthIdx = Number(m) - 1;
    if (monthIdx >= 0 && monthIdx < 12) buckets[monthIdx]?.push(c.mood);
  }
  return buckets.map((moods) => {
    if (moods.length === 0) return null;
    const counts = new Map<CheckinMood, number>();
    for (const mood of moods) counts.set(mood, (counts.get(mood) ?? 0) + 1);
    let best: CheckinMood | null = null;
    let bestCount = 0;
    for (const [mood, count] of counts) {
      if (count > bestCount) {
        best = mood;
        bestCount = count;
      }
    }
    return best;
  });
}

/** 年度回顧：Wrapped 風格大數字統計，全 mock 資料 */
export function AnnualReview({ checkins, today }: { checkins: MockCheckin[]; today: string }) {
  const year = parseISO(today).getFullYear();

  const totalCheckinDays = useMemo(
    () => new Set(checkins.map((c) => c.checkinDate)).size,
    [checkins]
  );
  const topicsCount = MOCK_PRACTICES.length;
  const friendsCount = 12;
  const ringsCount = Math.max(1, Math.round(totalCheckinDays / 30));

  const monthlyDays = useMemo(() => monthlyActiveDays(checkins, year), [checkins, year]);
  const maxMonthlyDays = Math.max(...monthlyDays, 1);
  const monthMoods = useMemo(() => dominantMoodByMonth(checkins, year), [checkins, year]);

  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of checkins) {
      for (const tag of c.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [checkins]);

  return (
    <div className="flex flex-col gap-6">
      <div
        className="rounded-2xl px-6 py-8 text-center text-white"
        style={{ background: "linear-gradient(160deg, #16B9B3, #0E4E8A 65%, #0E2E5A)" }}
      >
        <p className="text-xs uppercase tracking-widest opacity-80">功能預覽</p>
        <h2 className="mt-2 text-2xl font-bold">{year} 年度回顧</h2>
        <p className="mt-3 text-sm leading-relaxed opacity-90">
          {format(parseISO(today), "M 月 d 日")}，你的島嶼旅程還在繼續
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-2xl bg-[#F5F7FA] p-4 text-center">
          <p className="text-3xl font-bold text-logo-cyan">{totalCheckinDays}</p>
          <p className="mt-1 text-xs text-[#8A9BA0]">全年打卡天</p>
        </div>
        <div className="rounded-2xl bg-[#F5F7FA] p-4 text-center">
          <p className="text-3xl font-bold text-logo-cyan">{topicsCount}</p>
          <p className="mt-1 text-xs text-[#8A9BA0]">學了主題</p>
        </div>
        <div className="rounded-2xl bg-[#F5F7FA] p-4 text-center">
          <p className="text-3xl font-bold text-logo-cyan">{friendsCount}</p>
          <p className="mt-1 text-xs text-[#8A9BA0]">認識島友</p>
        </div>
      </div>

      <section>
        <h3 className="text-sm font-semibold text-[#2D3436]">月度活躍度</h3>
        <div className="mt-3 flex items-end gap-1.5">
          {MONTH_LABELS.map((m) => {
            const days = monthlyDays[m - 1] ?? 0;
            return (
              <div key={m} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex h-16 w-full items-end">
                  <div
                    className="w-full rounded-sm bg-logo-cyan"
                    style={{
                      height: days ? `${Math.max(10, (days / maxMonthlyDays) * 100)}%` : "6%",
                    }}
                  />
                </div>
                <span className="text-[10px] text-[#8A9BA0]">{m}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-[#2D3436]">年度心情光譜</h3>
        <div className="mt-3 flex overflow-hidden rounded-full">
          {monthMoods.map((mood, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: 純視覺色帶，以月份序列為語意
              key={i}
              className="h-6 flex-1"
              style={{ backgroundColor: mood ? MOOD_GRADIENT_COLOR[mood] : "#E0E4E8" }}
              title={mood ? CHECKIN_MOOD_META[mood].label : "未記錄"}
            />
          ))}
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-[#8A9BA0]">
          <span>1 月</span>
          <span>12 月</span>
        </div>
      </section>

      {tagCounts.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-[#2D3436]">年度關鍵字</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {tagCounts.map(([tag, count]) => (
              <span
                key={tag}
                className="rounded-full border border-[#E0E4E8] bg-white px-3 py-1 text-sm text-[#636E72]"
              >
                #{tag}
                <span className="ml-1 text-xs text-[#8A9BA0]">{count}</span>
              </span>
            ))}
          </div>
        </section>
      )}

      <div className="rounded-2xl bg-[rgba(22,185,179,0.08)] p-5 text-center">
        <p className="text-base font-semibold leading-relaxed text-[#0E8E89]">
          你在島上留下了 {ringsCount} 圈年輪
        </p>
      </div>
    </div>
  );
}
