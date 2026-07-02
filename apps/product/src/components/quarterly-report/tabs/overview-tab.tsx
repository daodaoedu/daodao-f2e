"use client";

import { cn } from "@daodao/ui/lib/utils";
import { motion } from "motion/react";
import { MoodTrend } from "../components/mood-trend";
import { ReportStatCard } from "../components/stat-card";
import type { QuarterlyReportData } from "../types";

interface OverviewTabProps {
  data: QuarterlyReportData;
}

export function OverviewTab({ data }: OverviewTabProps) {
  const maxActiveDays = Math.max(...data.months.map((m) => m.activeDays));

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <ReportStatCard label="活躍天" value={data.stats.activeDays} />
        <ReportStatCard label="主題" value={data.stats.topics} color="#FFA10B" />
        <ReportStatCard label="互動" value={data.stats.interactions} color="#F9DA4C" />
        <ReportStatCard label="島友" value={data.stats.friends} color="#AFD24B" />
      </div>

      {/* Monthly activity bars */}
      <Section title="活躍度">
        <div className="space-y-3">
          {data.months.map((month) => (
            <div key={month.month} className="flex items-center gap-3">
              <span className="w-10 text-right text-xs text-[#536166]">{month.month}月</span>
              <div className="h-6 flex-1 overflow-hidden rounded-full bg-[#F0F2F4]">
                <motion.div
                  className="h-full rounded-full bg-[#16B9B3]"
                  initial={{ width: 0 }}
                  animate={{ width: `${(month.activeDays / maxActiveDays) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />
              </div>
              <span className="w-8 text-xs text-[#536166]">{month.activeDays}天</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Recent milestones preview */}
      <Section title="最近里程碑">
        <div className="space-y-2">
          {data.milestones.slice(0, 3).map((m) => (
            <div key={m.date} className="flex items-center gap-2">
              <div className="size-1.5 shrink-0 rounded-full bg-[#16B9B3]" />
              <span className="truncate text-sm text-[#2D3436]">{m.title}</span>
              <span className="ml-auto shrink-0 text-xs text-[#8A9BA0]">
                {new Date(m.date).toLocaleDateString("zh-TW", { month: "numeric", day: "numeric" })}
              </span>
            </div>
          ))}
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
                  <div className="h-full rounded-full bg-[#16B9B3]" style={{ width: `${dim.score}%` }} />
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
