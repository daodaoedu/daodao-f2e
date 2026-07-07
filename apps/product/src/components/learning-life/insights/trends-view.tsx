"use client";

import { Card } from "@daodao/ui/components/card";
import { useMemo } from "react";
import { getDailyCheckinCounts, getMoodDistribution } from "../checkin-stats";
import { PeriodSelector, SectionHeader, SparklineCard, TagCloud, TrendBars } from "../components";
import { METRIC_CONFIGS } from "../constants";
import { learningLifeActions, useLearningLifeStore } from "../mock-store";
import type { MetricKey } from "../types";
import {
  calculateAverage,
  calculateTagFrequency,
  formatMetricValue,
  getRecordsForPeriod,
  getSparklineData,
  getTrendDirection,
} from "../utils";

const SPARKLINE_KEYS: MetricKey[] = ["energy", "sleep", "focus"];

interface TrendsViewProps {
  today: string;
}

export function TrendsView({ today }: TrendsViewProps) {
  const { records, checkins, activePeriod } = useLearningLifeStore();

  const periodRecords = useMemo(
    () => getRecordsForPeriod(records, activePeriod, today),
    [records, activePeriod, today]
  );
  const frequency = useMemo(
    () => getDailyCheckinCounts(checkins, today, activePeriod),
    [checkins, today, activePeriod]
  );
  const moodDist = useMemo(
    () => getMoodDistribution(checkins, today, activePeriod),
    [checkins, today, activePeriod]
  );
  const tagFrequency = useMemo(() => calculateTagFrequency(periodRecords), [periodRecords]);
  const maxCount = Math.max(...frequency.map((d) => d.count), 1);
  const maxMoodCount = Math.max(...moodDist.map((m) => m.count), 1);

  return (
    <div className="flex flex-col gap-6">
      <PeriodSelector value={activePeriod} onChange={learningLifeActions.setActivePeriod} />

      <Card className="border-[#E0E4E8] p-4">
        <SectionHeader title="✅ 打卡頻率" />
        <TrendBars
          className="mt-3 h-16"
          data={frequency.map((d) => ({ date: d.date, value: d.count || null }))}
          max={maxCount}
        />
      </Card>

      {/* 心情用分佈不用平均折線：折線暗示「越高越好」，會教使用者避開有挫折的難題 */}
      <Card className="border-[#E0E4E8] p-4">
        <SectionHeader title="😄 打卡心情分佈" />
        <p className="mt-1 text-xs text-[#8A9BA0]">
          心情是認識自己的訊號，不是分數——挫折常是突破的前奏
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {moodDist.map((m) => (
            <div key={m.mood} className="flex items-center gap-2">
              <span className="w-6 text-base">{m.emoji}</span>
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

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {SPARKLINE_KEYS.map((key) => {
          const config = METRIC_CONFIGS.find((m) => m.key === key);
          if (!config) return null;
          return (
            <SparklineCard
              key={key}
              config={config}
              value={formatMetricValue(calculateAverage(periodRecords, key), key)}
              data={getSparklineData(periodRecords, key)}
              trend={getTrendDirection(periodRecords, key)}
            />
          );
        })}
      </div>

      {tagFrequency.length > 0 && (
        <section>
          <SectionHeader title="🏷️ 環境標籤分佈" />
          <div className="mt-3">
            <TagCloud tags={tagFrequency} />
          </div>
        </section>
      )}
    </div>
  );
}
