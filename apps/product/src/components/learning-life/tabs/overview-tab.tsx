"use client";

import { useMemo } from "react";
import {
  ConnectedServicesGrid,
  CorrelationCard,
  DayDetailCard,
  InsightBanner,
  MetricPill,
  MoodBarChart,
  SectionHeader,
  SparklineCard,
  TagCloud,
} from "../components";
import { METRIC_CONFIGS } from "../constants";
import { MOCK_CORRELATIONS } from "../mock-data";
import type { DailyRecord } from "../types";
import {
  calculateAverage,
  calculateTagFrequency,
  formatMetricValue,
  getSparklineData,
  getTrendDirection,
} from "../utils";

interface OverviewTabProps {
  records: DailyRecord[];
  todayRecord?: DailyRecord;
}

const PILL_METRICS = [
  "mood",
  "sleep",
  "steps",
  "exercise",
  "focus",
  "coffee",
  "spend",
  "stress",
] as const;
const SPARKLINE_METRICS = ["mood", "sleep", "steps", "exercise"] as const;

export function OverviewTab({ records, todayRecord }: OverviewTabProps) {
  const averages = useMemo(() => {
    const result: Record<string, string> = {};
    for (const key of PILL_METRICS) {
      const avg = calculateAverage(records, key);
      result[key] = formatMetricValue(avg, key);
    }
    return result;
  }, [records]);

  const tagFrequency = useMemo(() => calculateTagFrequency(records), [records]);
  const topCorrelations = MOCK_CORRELATIONS.slice(0, 3);

  const insight = useMemo(() => {
    const moodAvg = calculateAverage(records, "mood");
    const sleepAvg = calculateAverage(records, "sleep");
    if (moodAvg >= 6.5)
      return `過去這段期間心情平均 ${moodAvg.toFixed(1)}/9，狀態不錯！睡眠平均 ${sleepAvg.toFixed(1)}h。`;
    if (sleepAvg < 6.5)
      return `睡眠平均只有 ${sleepAvg.toFixed(1)}h，可能影響到心情（${moodAvg.toFixed(1)}/9）。試著早點休息？`;
    return `心情平均 ${moodAvg.toFixed(1)}/9，睡眠 ${sleepAvg.toFixed(1)}h。持續記錄，觀察自己的模式。`;
  }, [records]);

  return (
    <div className="flex flex-col gap-6">
      <InsightBanner text={insight} />

      <section>
        <SectionHeader title="日均概覽" />
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PILL_METRICS.map((key) => {
            const config = METRIC_CONFIGS.find((m) => m.key === key);
            if (!config) return null;
            return (
              <MetricPill
                key={key}
                emoji={config.emoji}
                label={config.label}
                value={averages[key] ?? "—"}
                unit={config.unit}
              />
            );
          })}
        </div>
      </section>

      <section>
        <SectionHeader title="心情走勢" />
        <div className="mt-3">
          <MoodBarChart records={records} />
        </div>
      </section>

      <section>
        <SectionHeader title="發現的相關性" />
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {topCorrelations.map((c) => (
            <CorrelationCard key={c.id} correlation={c} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="趨勢一覽" />
        <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {SPARKLINE_METRICS.map((key) => {
            const config = METRIC_CONFIGS.find((m) => m.key === key);
            if (!config) return null;
            const data = getSparklineData(records, key);
            const avg = calculateAverage(records, key);
            const trend = getTrendDirection(records, key);
            return (
              <SparklineCard
                key={key}
                config={config}
                value={formatMetricValue(avg, key)}
                data={data}
                trend={trend}
              />
            );
          })}
        </div>
      </section>

      {tagFrequency.length > 0 && (
        <section>
          <SectionHeader title="標籤頻率" />
          <div className="mt-3">
            <TagCloud tags={tagFrequency} />
          </div>
        </section>
      )}

      {todayRecord && (
        <section>
          <SectionHeader title="今日" />
          <div className="mt-3">
            <DayDetailCard record={todayRecord} />
          </div>
        </section>
      )}

      <section>
        <SectionHeader title="已連結服務" />
        <div className="mt-3">
          <ConnectedServicesGrid />
        </div>
      </section>
    </div>
  );
}
