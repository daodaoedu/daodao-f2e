import { format, getDay, parseISO, subDays } from "date-fns";
import { METRIC_CONFIGS } from "./constants";
import type { DailyRecord, MetricKey } from "./types";

export function getRecordsForPeriod(
  records: Record<string, DailyRecord>,
  days: number,
  referenceDate: string
): DailyRecord[] {
  const ref = parseISO(referenceDate);
  const result: DailyRecord[] = [];
  for (let i = 0; i < days; i++) {
    const key = format(subDays(ref, i), "yyyy-MM-dd");
    const record = records[key];
    if (record) result.push(record);
  }
  return result;
}

/** 平均值（略過 0 = 未記錄） */
export function calculateAverage(records: DailyRecord[], key: MetricKey): number {
  const values = records.map((r) => r[key]).filter((v) => v > 0);
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function calculateTagFrequency(
  records: DailyRecord[]
): Array<{ tag: string; count: number; percentage: number }> {
  const counts: Record<string, number> = {};
  for (const record of records) {
    for (const tag of record.contextTags) {
      counts[tag] = (counts[tag] ?? 0) + 1;
    }
  }
  const total = records.length || 1;
  return Object.entries(counts)
    .map(([tag, count]) => ({ tag, count, percentage: Math.round((count / total) * 100) }))
    .sort((a, b) => b.count - a.count);
}

export function getSparklineData(
  records: DailyRecord[],
  key: MetricKey
): Array<{ date: string; value: number }> {
  return [...records]
    .filter((r) => r[key] > 0)
    .reverse()
    .map((r) => ({ date: r.date, value: r[key] }));
}

export function formatMetricValue(value: number, key: MetricKey): string {
  const config = METRIC_CONFIGS.find((m) => m.key === key);
  if (config?.unit === "h") return value.toFixed(1);
  return String(Math.round(value));
}

export function getDayOfWeek(dateStr: string): string {
  const dayNames = ["日", "一", "二", "三", "四", "五", "六"];
  return dayNames[getDay(parseISO(dateStr))] ?? "";
}

export function getDateLabel(dateStr: string): string {
  return format(parseISO(dateStr), "M/d");
}

export function getTrendDirection(records: DailyRecord[], key: MetricKey): "up" | "down" | "flat" {
  const values = records.filter((r) => r[key] > 0).map((r) => r[key]);
  if (values.length < 4) return "flat";

  const half = Math.floor(values.length / 2);
  const recentAvg = values.slice(0, half).reduce((s, v) => s + v, 0) / half;
  const olderAvg = values.slice(half).reduce((s, v) => s + v, 0) / (values.length - half);

  const diff = recentAvg - olderAvg;
  const threshold = olderAvg * 0.05;
  if (diff > threshold) return "up";
  if (diff < -threshold) return "down";
  return "flat";
}
