import type { ElementType } from "react";

export type TabId = "today" | "insights";

export type InsightView = "cards" | "trends" | "days" | "correlations";

export type MetricSource = "manual" | "csv-import" | "integration" | "mock";

export type CorrelationStrength = "strong" | "moderate" | "weak";

/** 打卡心情（鏡射後端 CheckInEntity.mood） */
export type CheckinMood = "give_up" | "frustrated" | "bored" | "neutral" | "good" | "happy";

/** 打卡記錄（結構鏡射 CheckInEntity，未來可換真 API） */
export interface MockCheckin {
  id: string;
  practiceId: string;
  practiceTitle: string;
  /** yyyy-MM-dd */
  checkinDate: string;
  mood: CheckinMood;
  note: string;
  tags: string[];
}

/** 每日脈絡（配角）：幫助理解學習模式的生活維度；0 = 未記錄 */
export interface DailyRecord {
  date: string;
  /** 精力 1-5 */
  energy: number;
  /** 睡眠小時數 */
  sleep: number;
  /** 專注品質 1-5 */
  focus: number;
  /** 運動分鐘數 */
  exercise: number;
  /** 壓力 1-5 */
  stress: number;
  /** 環境標籤：在家、圖書館… */
  contextTags: string[];
  note: string;
  source: Record<string, MetricSource>;
}

/** 系統洞察卡（第二層）：一句學習語境的結論＋下鑽目標 */
export interface Insight {
  id: string;
  icon: ElementType;
  conclusion: string;
  detail: string;
  drillDown: Exclude<InsightView, "cards">;
}

export interface CorrelationMetric {
  key: string;
  icon: ElementType;
  label: string;
}

export interface Correlation {
  id: string;
  metricA: CorrelationMetric;
  metricB: CorrelationMetric;
  rValue: number;
  strength: CorrelationStrength;
  direction: "positive" | "negative";
  description: string;
  scatterData?: Array<{ x: number; y: number }>;
}

export interface ConnectedService {
  id: string;
  name: string;
  icon: ElementType;
  connected: boolean;
}

export type MetricKey = "energy" | "sleep" | "focus" | "exercise" | "stress";

export interface MetricConfig {
  key: MetricKey;
  icon: ElementType;
  label: string;
  unit: string;
  color: string;
  bgColor: string;
}

export interface CustomFieldExample {
  icon: ElementType;
  label: string;
}

export interface TabConfig {
  value: TabId;
  label: string;
}
