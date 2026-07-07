"use client";

import { Card } from "@daodao/ui/components/card";
import { format, getISOWeek, parseISO, subDays } from "date-fns";
import { Smile, Tag, TrendingUp, Trophy } from "lucide-react";
import { useMemo } from "react";
import { getMoodDistribution, getWeeklySummary } from "../checkin-stats";
import { SectionHeader, TagCloud, TrendBars } from "../components";
import type { DailyRecord, MockCheckin } from "../types";
import { calculateTagFrequency, getRecordsForPeriod } from "../utils";

interface WeeklyReportProps {
  checkins: MockCheckin[];
  records: Record<string, DailyRecord>;
  today: string;
}

/** 週報：升級 WeeklyHero 為完整週回顧頁 */
export function WeeklyReport({ checkins, records, today }: WeeklyReportProps) {
  const summary = getWeeklySummary(checkins, today);
  const moodDist = useMemo(() => getMoodDistribution(checkins, today, 7), [checkins, today]);
  const weekRecords = useMemo(() => getRecordsForPeriod(records, 7, today), [records, today]);
  const tagFrequency = useMemo(() => calculateTagFrequency(weekRecords), [weekRecords]);

  const weekNumber = getISOWeek(parseISO(today));
  const rangeStart = format(subDays(parseISO(today), 6), "M/d");
  const rangeEnd = format(parseISO(today), "M/d");

  const diff = summary.thisWeekDays - summary.lastWeekDays;
  let diffLabel = "跟上週一樣";
  if (diff > 0) diffLabel = `比上週多 ${diff} 天`;
  if (diff < 0) diffLabel = `比上週少 ${Math.abs(diff)} 天`;

  const maxMoodCount = Math.max(...moodDist.map((m) => m.count), 1);
  const maxEnergy = Math.max(...weekRecords.map((r) => r.energy), 1);

  const bestDay = useMemo(() => {
    if (weekRecords.length === 0) return null;
    return [...weekRecords].sort((a, b) => b.focus - a.focus)[0] ?? null;
  }, [weekRecords]);
  const bestDayCheckin = bestDay ? checkins.find((c) => c.checkinDate === bestDay.date) : undefined;

  return (
    <div className="flex flex-col gap-6">
      <div
        className="rounded-2xl px-5 py-4 text-white"
        style={{ background: "linear-gradient(135deg, #16B9B3, #0E8E89)" }}
      >
        <p className="text-xs opacity-80">
          第 {weekNumber} 週回顧 · {rangeStart} - {rangeEnd}
        </p>
        <p className="mt-1 text-base font-semibold leading-relaxed">{summary.sentence}</p>
        <TrendBars
          className="mt-3"
          data={summary.last7.map((d) => ({ date: d.date, value: d.count || null }))}
          max={Math.max(...summary.last7.map((d) => d.count), 1)}
          color="rgba(255,255,255,0.9)"
        />
      </div>

      <Card className="border-[#E0E4E8] p-4">
        <SectionHeader title="打卡統計" />
        <p className="mt-2 text-2xl font-bold text-[#2D3436]">
          {summary.thisWeekDays}
          <span className="ml-1 text-sm font-normal text-[#8A9BA0]">/ 7 天</span>
        </p>
        <p className="mt-1 text-xs text-[#8A9BA0]">{diffLabel}</p>
      </Card>

      <Card className="border-[#E0E4E8] p-4">
        <SectionHeader title="心情分佈" icon={Smile} />
        <div className="mt-3 flex flex-col gap-2">
          {moodDist.map((m) => (
            <div key={m.mood} className="flex items-center gap-2">
              <m.icon className="size-5 shrink-0" />
              <span className="w-12 shrink-0 text-xs text-[#636E72]">{m.label}</span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-[#F5F7FA]">
                <div
                  className="h-full rounded-full bg-[#F472B6]"
                  style={{ width: `${(m.count / maxMoodCount) * 100}%` }}
                />
              </div>
              <span className="w-6 shrink-0 text-right text-xs text-[#8A9BA0]">{m.count}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="border-[#E0E4E8] p-4">
        <SectionHeader title="精力趨勢" icon={TrendingUp} />
        <TrendBars
          className="mt-3 h-16"
          data={weekRecords
            .slice()
            .reverse()
            .map((r) => ({ date: r.date, value: r.energy || null }))}
          max={maxEnergy}
          color="#FBBF24"
        />
      </Card>

      {bestDay && bestDay.focus > 0 && (
        <Card className="border-[#E0E4E8] p-4">
          <SectionHeader title="最佳學習日" icon={Trophy} />
          <p className="mt-2 text-sm leading-relaxed text-[#636E72]">
            {format(parseISO(bestDay.date), "M/d")}，專注品質 {bestDay.focus}/5
            {bestDayCheckin && "，打卡心情不錯"}
          </p>
        </Card>
      )}

      {tagFrequency.length > 0 && (
        <section>
          <SectionHeader title="本週標籤雲" icon={Tag} />
          <div className="mt-3">
            <TagCloud tags={tagFrequency} />
          </div>
        </section>
      )}
    </div>
  );
}
