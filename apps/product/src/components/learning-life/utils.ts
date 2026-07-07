import { format } from "date-fns";
import { METRIC_CONFIGS, MOOD_EMOJIS } from "./constants";
import type { CorrelationStrength, DailyRecord } from "./types";

export function getRecordsForPeriod(
  records: Record<string, DailyRecord>,
  days: number,
  referenceDate: string
): DailyRecord[] {
  const ref = new Date(referenceDate);
  const result: DailyRecord[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(ref);
    d.setDate(d.getDate() - i);
    const key = format(d, "yyyy-MM-dd");
    const record = records[key];
    if (record) result.push(record);
  }
  return result;
}

export function calculateAverage(records: DailyRecord[], key: keyof DailyRecord): number {
  if (records.length === 0) return 0;
  const values = records.map((r) => r[key]).filter((v): v is number => typeof v === "number");
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function getMoodEmoji(mood: number): string {
  const idx = Math.max(0, Math.min(MOOD_EMOJIS.length - 1, mood - 1));
  return MOOD_EMOJIS[idx] ?? "🙂";
}

export function getMoodColor(mood: number): string {
  if (mood >= 7) return "#16B9B3";
  if (mood >= 5) return "#FBBF24";
  if (mood >= 3) return "#F97316";
  return "#EF4444";
}

export function getStrengthBadgeVariant(
  strength: CorrelationStrength
): "default" | "secondary" | "outline" {
  switch (strength) {
    case "strong":
      return "default";
    case "moderate":
      return "secondary";
    case "weak":
      return "outline";
  }
}

export function calculateTagFrequency(
  records: DailyRecord[]
): Array<{ tag: string; count: number; percentage: number }> {
  const counts: Record<string, number> = {};
  for (const record of records) {
    for (const tag of record.tags) {
      counts[tag] = (counts[tag] ?? 0) + 1;
    }
  }
  const total = records.length || 1;
  return Object.entries(counts)
    .map(([tag, count]) => ({
      tag,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

export function getSparklineData(
  records: DailyRecord[],
  key: keyof DailyRecord
): Array<{ date: string; value: number }> {
  return [...records]
    .filter((r) => typeof r[key] === "number")
    .reverse()
    .map((r) => ({
      date: r.date,
      value: r[key] as number,
    }));
}

export function formatMetricValue(value: number, key: string): string {
  const config = METRIC_CONFIGS.find((m) => m.key === key);
  if (!config) return String(Math.round(value));

  switch (config.unit) {
    case "h":
      return value.toFixed(1);
    case "bpm":
    case "":
    case "杯":
    case "min":
      return String(Math.round(value));
    case "TWD":
      return `$${Math.round(value).toLocaleString()}`;
    default:
      return String(Math.round(value));
  }
}

export function getDayOfWeek(dateStr: string): string {
  const dayNames = ["日", "一", "二", "三", "四", "五", "六"];
  const day = new Date(dateStr).getDay();
  return dayNames[day] ?? "";
}

export function getDateLabel(dateStr: string): string {
  return format(new Date(dateStr), "M/d");
}

export function getTrendDirection(
  records: DailyRecord[],
  key: keyof DailyRecord
): "up" | "down" | "flat" {
  if (records.length < 4) return "flat";
  const values = records.filter((r) => typeof r[key] === "number").map((r) => r[key] as number);
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
