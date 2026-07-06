export type TabId = "overview" | "correlations" | "trends" | "day" | "track";

export type MetricSource = "manual" | "csv-import" | "mock" | "api";

export type CustomFieldType = "quantity" | "time" | "scale" | "percentage" | "time-of-day" | "tag";

export type CorrelationStrength = "strong" | "moderate" | "weak";

export interface DailyRecord {
  date: string;
  mood: number;
  energy: number;
  sleep: number;
  steps: number;
  focus: number;
  exercise: number;
  coffee: number;
  spend: number;
  stress: number;
  water: number;
  heartRate: number;
  tags: string[];
  note: string;
  intention: string;
  reflection: string;
  source: Record<string, MetricSource>;
}

export interface CustomField {
  id: string;
  name: string;
  emoji: string;
  type: CustomFieldType;
  unit?: string;
}

export interface MetricConfig {
  key: keyof DailyRecord;
  emoji: string;
  label: string;
  unit: string;
  color: string;
  bgColor: string;
}

export interface CorrelationMetric {
  key: string;
  emoji: string;
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
  emoji: string;
  connected: boolean;
}

export interface TabConfig {
  value: TabId;
  label: string;
}
