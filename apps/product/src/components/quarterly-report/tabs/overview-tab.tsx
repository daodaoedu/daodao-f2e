"use client";

import { cn } from "@daodao/ui/lib/utils";
import { MoodTrend } from "../components/mood-trend";
import { ReportStatCard } from "../components/stat-card";
import type { QuarterlyReportData } from "../types";

interface OverviewTabProps {
  data: QuarterlyReportData;
}

/** 依設計稿的數據卡配色：淡色底 + 主題色數字 */
const STAT_STYLES = [
  { color: "#16B9B3", bg: "#E8F8F7" },
  { color: "#FFA10B", bg: "#FFF4E3" },
  { color: "#D9A606", bg: "#FDF6DC" },
  { color: "#7BA428", bg: "#F3F8E3" },
] as const;

/** 里程碑列的循環配色（dot 與淡色底） */
const MILESTONE_STYLES = [
  { dot: "#16B9B3", bg: "#F0FBFA" },
  { dot: "#FFA10B", bg: "#FFF8EC" },
  { dot: "#D9A606", bg: "#FDF9E8" },
] as const;

const DAYS_PER_MONTH = 30;

/**
 * 依當月活躍天數產生逐日方格（設計稿的 heatmap 樣式）。
 * mock 資料只有月總數，將活躍日平均分佈以呈現視覺效果。
 */
function monthCells(activeDays: number): boolean[] {
  const cells: boolean[] = new Array(DAYS_PER_MONTH).fill(false);
  if (activeDays <= 0) return cells;
  const step = DAYS_PER_MONTH / activeDays;
  for (let i = 0; i < activeDays; i++) {
    cells[Math.min(Math.floor(i * step), DAYS_PER_MONTH - 1)] = true;
  }
  return cells;
}

export function OverviewTab({ data }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "活躍天", value: data.stats.activeDays, style: STAT_STYLES[0] },
          { label: "主題", value: data.stats.topics, style: STAT_STYLES[1] },
          { label: "互動", value: data.stats.interactions, style: STAT_STYLES[2] },
          { label: "島友", value: data.stats.friends, style: STAT_STYLES[3] },
        ].map((stat) => (
          <ReportStatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            color={stat.style.color}
            bg={stat.style.bg}
          />
        ))}
      </div>

      {/* Daily activity heatmap */}
      <Section title="活躍度">
        <div className="flex gap-3">
          {data.months.map((month) => (
            <div key={month.month} className="flex-1">
              <div className="flex flex-wrap gap-[3px]">
                {monthCells(month.activeDays).map((active, i) => (
                  <div
                    // biome-ignore lint/suspicious/noArrayIndexKey: 純視覺方格，無資料語意
                    key={i}
                    className={cn("size-2 rounded-[2px]", active ? "bg-[#16B9B3]" : "bg-[#E4EAE9]")}
                  />
                ))}
              </div>
              <p className="mt-1.5 text-center text-xs text-[#8A9BA0]">{month.month}月</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Recent milestones preview */}
      <Section title="最近里程碑">
        <div className="space-y-2">
          {data.milestones.slice(0, 3).map((m, index) => {
            const style = MILESTONE_STYLES[index % MILESTONE_STYLES.length] ?? MILESTONE_STYLES[0];
            return (
              <div
                key={m.date}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5"
                style={{ backgroundColor: style.bg }}
              >
                <div
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: style.dot }}
                />
                <span className="truncate text-sm font-medium text-[#2D3436]">{m.title}</span>
                <span className="ml-auto shrink-0 text-xs text-[#8A9BA0]">
                  {new Date(m.date).toLocaleDateString("zh-TW", {
                    month: "numeric",
                    day: "numeric",
                    timeZone: "UTC",
                  })}
                </span>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Mood trend */}
      <Section title="心情趨勢">
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#8A9BA0]">季初</span>
          <div className="flex-1">
            <MoodTrend moodCurve={data.moodCurve} />
          </div>
          <span className="text-xs text-[#8A9BA0]">季末</span>
        </div>
      </Section>

      {/* Learning top 3 */}
      <Section title="學習領域">
        <div className="space-y-2">
          {[...data.learningRadar]
            .sort((a, b) => b.score - a.score)
            .slice(0, 3)
            .map((dim) => (
              <div key={dim.dimension} className="flex items-center gap-3">
                <span className="w-20 text-sm text-[#2D3436]">{dim.dimension}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#F0F2F4]">
                  <div
                    className="h-full rounded-full bg-[#16B9B3]"
                    style={{ width: `${dim.score}%` }}
                  />
                </div>
                <span className="w-8 text-right text-xs text-[#536166]">{dim.score}%</span>
              </div>
            ))}
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]")}>
      <h3 className="mb-3 text-sm font-bold text-[#2D3436]">{title}</h3>
      {children}
    </div>
  );
}
