import type {
  CheckinMood,
  ConnectedService,
  CorrelationStrength,
  CustomFieldType,
  MetricConfig,
  TabConfig,
} from "./types";

export const TABS: TabConfig[] = [
  { value: "overview", label: "總覽" },
  { value: "correlations", label: "相關性" },
  { value: "trends", label: "趨勢" },
  { value: "day", label: "每日" },
  { value: "track", label: "追蹤" },
];

export const MOOD_EMOJIS = ["😢", "😔", "😕", "😐", "🙂", "😊", "😄", "😁", "🤩"] as const;

export const METRIC_CONFIGS: MetricConfig[] = [
  {
    key: "steps",
    emoji: "👟",
    label: "步數",
    unit: "",
    color: "#16B9B3",
    bgColor: "rgba(22,185,179,0.05)",
  },
  {
    key: "sleep",
    emoji: "😴",
    label: "睡眠",
    unit: "h",
    color: "#6366F1",
    bgColor: "rgba(99,102,241,0.05)",
  },
  {
    key: "mood",
    emoji: "😊",
    label: "心情",
    unit: "/9",
    color: "#F472B6",
    bgColor: "rgba(244,114,182,0.05)",
  },
  {
    key: "energy",
    emoji: "🔋",
    label: "精力",
    unit: "/9",
    color: "#FBBF24",
    bgColor: "rgba(251,191,36,0.05)",
  },
  {
    key: "coffee",
    emoji: "☕",
    label: "咖啡",
    unit: "杯",
    color: "#92400E",
    bgColor: "rgba(146,64,14,0.05)",
  },
  {
    key: "focus",
    emoji: "🎯",
    label: "專注",
    unit: "h",
    color: "#0EA5E9",
    bgColor: "rgba(14,165,233,0.05)",
  },
  {
    key: "exercise",
    emoji: "💪",
    label: "運動",
    unit: "min",
    color: "#14B8A6",
    bgColor: "rgba(20,184,166,0.05)",
  },
  {
    key: "spend",
    emoji: "💰",
    label: "花費",
    unit: "TWD",
    color: "#EAB308",
    bgColor: "rgba(234,179,8,0.05)",
  },
  {
    key: "stress",
    emoji: "😤",
    label: "壓力",
    unit: "/5",
    color: "#EF4444",
    bgColor: "rgba(239,68,68,0.05)",
  },
  {
    key: "water",
    emoji: "💧",
    label: "喝水",
    unit: "杯",
    color: "#3B82F6",
    bgColor: "rgba(59,130,246,0.05)",
  },
  {
    key: "heartRate",
    emoji: "❤️",
    label: "心率",
    unit: "bpm",
    color: "#EF4444",
    bgColor: "rgba(239,68,68,0.05)",
  },
];

export const PRESET_TAGS = [
  "攀岩",
  "衝浪",
  "跑步",
  "瑜伽",
  "冥想",
  "手沖咖啡",
  "外食",
  "自煮",
  "在家工作",
  "辦公室",
  "咖啡廳",
  "圖書館",
  "讀書",
  "side project",
  "社交",
  "早起",
  "podcast",
  "看影片",
  "實作",
  "討論",
] as const;

export const CONNECTED_SERVICES: ConnectedService[] = [
  { id: "apple-health", name: "Apple Health", emoji: "🍎", connected: true },
  { id: "strava", name: "Strava", emoji: "🏃", connected: true },
  { id: "spotify", name: "Spotify", emoji: "🎵", connected: true },
  { id: "google-cal", name: "Google Cal", emoji: "📅", connected: true },
  { id: "github", name: "GitHub", emoji: "💻", connected: true },
  { id: "notion", name: "Notion", emoji: "📝", connected: false },
  { id: "bank-csv", name: "Bank CSV", emoji: "🏦", connected: false },
  { id: "google-maps", name: "Google Maps", emoji: "📍", connected: false },
];

export const STRENGTH_LABELS: Record<CorrelationStrength, string> = {
  strong: "強相關",
  moderate: "中等相關",
  weak: "弱相關",
};

export const STRENGTH_COLORS: Record<CorrelationStrength, { text: string; bg: string }> = {
  strong: { text: "#16A34A", bg: "rgba(22,163,106,0.1)" },
  moderate: { text: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
  weak: { text: "#8A9BA0", bg: "rgba(148,163,184,0.1)" },
};

export const CUSTOM_FIELD_TYPES: Array<{
  type: CustomFieldType;
  emoji: string;
  label: string;
  description: string;
}> = [
  { type: "quantity", emoji: "🔢", label: "數量", description: "喝水杯數、閱讀頁數" },
  { type: "time", emoji: "⏱️", label: "時間", description: "冥想、午睡時間" },
  { type: "scale", emoji: "📏", label: "量表 1-9", description: "精力、焦慮程度" },
  { type: "percentage", emoji: "%", label: "百分比", description: "工作完成度" },
  { type: "time-of-day", emoji: "🕐", label: "時刻", description: "起床、入睡時間" },
  { type: "tag", emoji: "🏷️", label: "標籤", description: "吃藥、頭痛、運動" },
];

export const PERIOD_OPTIONS = [7, 30, 90, 180] as const;
export type PeriodOption = (typeof PERIOD_OPTIONS)[number];

/** 心情是認識自己的訊號，不是表現分數——刻意不含 score，避免暗示「挫折＝壞」 */
export const CHECKIN_MOOD_META: Record<CheckinMood, { emoji: string; label: string }> = {
  give_up: { emoji: "😩", label: "想放棄" },
  frustrated: { emoji: "😖", label: "挫折" },
  bored: { emoji: "😑", label: "無聊" },
  neutral: { emoji: "😐", label: "普通" },
  good: { emoji: "🙂", label: "不錯" },
  happy: { emoji: "😄", label: "開心" },
};
