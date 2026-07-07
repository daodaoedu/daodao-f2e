"use client";

import { Card } from "@daodao/ui/components/card";
import { format, parseISO } from "date-fns";
import { Sparkles, Trophy } from "lucide-react";
import { useMemo } from "react";
import { SectionHeader } from "../components";
import { CHECKIN_MOOD_META } from "../constants";
import { useLearningLifeStore } from "../mock-store";
import type { CheckinMood, DailyRecord, MockCheckin } from "../types";
import { calculateAverage, calculateTagFrequency, getRecordsForPeriod } from "../utils";

const MOOD_DOT_COLOR: Record<CheckinMood, string> = {
  give_up: "#94A3B8",
  frustrated: "#FB7185",
  bored: "#FBBF24",
  neutral: "#60A5FA",
  good: "#34D399",
  happy: "#F472B6",
};

const MILESTONE_STYLES = [
  { dot: "#16B9B3", bg: "#F0FBFA" },
  { dot: "#FFA10B", bg: "#FFF8EC" },
] as const;

/** 月度洞察：找出當月哪個環境標籤下平均專注品質最高（沒有足夠資料時回傳 null） */
function findBestFocusTagInsight(records: DailyRecord[]): string | null {
  const tagFocusSum = new Map<string, { sum: number; count: number }>();
  for (const record of records) {
    if (record.focus <= 0) continue;
    for (const tag of record.contextTags) {
      const entry = tagFocusSum.get(tag) ?? { sum: 0, count: 0 };
      entry.sum += record.focus;
      entry.count += 1;
      tagFocusSum.set(tag, entry);
    }
  }
  let best: { tag: string; avg: number } | null = null;
  for (const [tag, { sum, count }] of tagFocusSum) {
    if (count < 2) continue;
    const avg = sum / count;
    if (!best || avg > best.avg) best = { tag, avg };
  }
  if (!best) return null;
  return `這個月在 #${best.tag} 的日子專注品質最高，平均 ${best.avg.toFixed(1)}/5`;
}

/** 月報：月度統計＋心情曲線＋里程碑＋自動洞察 */
export function MonthlyReport() {
  const { records, checkins } = useLearningLifeStore();
  const today = format(new Date(), "yyyy-MM-dd");
  const monthLabel = format(parseISO(today), "M");

  const monthRecords = useMemo(() => getRecordsForPeriod(records, 30, today), [records, today]);
  const tagFrequency = useMemo(() => calculateTagFrequency(monthRecords), [monthRecords]);
  const topTag = tagFrequency[0];
  const avgEnergy = calculateAverage(monthRecords, "energy");

  const checkinDaysInMonth = useMemo(() => {
    const start = format(parseISO(today), "yyyy-MM-dd").slice(0, 7);
    const days = new Set(
      checkins.filter((c) => c.checkinDate.startsWith(start)).map((c) => c.checkinDate)
    );
    return days.size;
  }, [checkins, today]);

  const moodDots = useMemo(() => {
    const byDate = new Map<string, MockCheckin[]>();
    for (const c of checkins) {
      const list = byDate.get(c.checkinDate) ?? [];
      list.push(c);
      byDate.set(c.checkinDate, list);
    }
    return monthRecords
      .slice()
      .reverse()
      .map((r) => {
        const dayCheckins = byDate.get(r.date) ?? [];
        const dominant = dayCheckins[0]?.mood;
        return { date: r.date, mood: dominant };
      });
  }, [monthRecords, checkins]);

  const insight = useMemo(() => findBestFocusTagInsight(monthRecords), [monthRecords]);

  const milestones = [
    { title: "連續打卡滿 7 天", detail: "維持了穩定的學習節奏" },
    { title: "完成一次深度複習", detail: "在圖書館專注學習超過 2 小時" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs text-[#8A9BA0]">功能預覽</p>
        <h2 className="mt-1 text-xl font-bold text-[#2D3436]">{monthLabel} 月學習報告</h2>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Card className="border-[#E0E4E8] p-3 text-center">
          <p className="text-xl font-bold text-logo-cyan">{checkinDaysInMonth}</p>
          <p className="mt-1 text-xs text-[#8A9BA0]">打卡天數</p>
        </Card>
        <Card className="border-[#E0E4E8] p-3 text-center">
          <p className="text-xl font-bold text-logo-cyan">
            {avgEnergy ? avgEnergy.toFixed(1) : "-"}
          </p>
          <p className="mt-1 text-xs text-[#8A9BA0]">平均精力</p>
        </Card>
        <Card className="border-[#E0E4E8] p-3 text-center">
          <p className="truncate text-xl font-bold text-logo-cyan">{topTag ? topTag.tag : "-"}</p>
          <p className="mt-1 text-xs text-[#8A9BA0]">最常去的地方</p>
        </Card>
      </div>

      <Card className="border-[#E0E4E8] p-4">
        <SectionHeader title="心情曲線" />
        <p className="mt-1 text-xs text-[#8A9BA0]">30 天的心情訊號，不代表越高越好</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {moodDots.map((d) => (
            <div
              key={d.date}
              className="size-2.5 rounded-full"
              style={{ backgroundColor: d.mood ? MOOD_DOT_COLOR[d.mood] : "#E0E4E8" }}
              title={d.mood ? CHECKIN_MOOD_META[d.mood].label : "未打卡"}
            />
          ))}
        </div>
      </Card>

      <section>
        <SectionHeader title="里程碑" icon={Trophy} />
        <div className="mt-3 flex flex-col gap-2">
          {milestones.map((m, i) => {
            const style = MILESTONE_STYLES[i % MILESTONE_STYLES.length] ?? MILESTONE_STYLES[0];
            return (
              <div
                key={m.title}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5"
                style={{ backgroundColor: style.bg }}
              >
                <div
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: style.dot }}
                />
                <div>
                  <p className="text-sm font-medium text-[#2D3436]">{m.title}</p>
                  <p className="text-xs text-[#8A9BA0]">{m.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {insight && (
        <Card className="border-[#E0E4E8] bg-[rgba(22,185,179,0.05)] p-4">
          <SectionHeader title="月度洞察" icon={Sparkles} />
          <p className="mt-2 text-sm leading-relaxed text-[#636E72]">{insight}</p>
        </Card>
      )}
    </div>
  );
}
