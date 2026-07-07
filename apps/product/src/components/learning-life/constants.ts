import type {
  CheckinMood,
  ConnectedService,
  CorrelationStrength,
  MetricConfig,
  TabConfig,
} from "./types";

export const TABS: TabConfig[] = [
  { value: "today", label: "今天" },
  { value: "insights", label: "洞察" },
];

/** 心情是認識自己的訊號，不是表現分數——刻意不含 score，避免暗示「挫折＝壞」 */
export const CHECKIN_MOOD_META: Record<CheckinMood, { emoji: string; label: string }> = {
  give_up: { emoji: "😩", label: "想放棄" },
  frustrated: { emoji: "😖", label: "挫折" },
  bored: { emoji: "😑", label: "無聊" },
  neutral: { emoji: "😐", label: "普通" },
  good: { emoji: "🙂", label: "不錯" },
  happy: { emoji: "😄", label: "開心" },
};

export const METRIC_CONFIGS: MetricConfig[] = [
  { key: "energy", emoji: "🔋", label: "精力", unit: "/5", color: "#FBBF24", bgColor: "rgba(251,191,36,0.05)" },
  { key: "sleep", emoji: "😴", label: "睡眠", unit: "h", color: "#6366F1", bgColor: "rgba(99,102,241,0.05)" },
  { key: "focus", emoji: "🎯", label: "專注品質", unit: "/5", color: "#0EA5E9", bgColor: "rgba(14,165,233,0.05)" },
  { key: "exercise", emoji: "💪", label: "運動", unit: "min", color: "#14B8A6", bgColor: "rgba(20,184,166,0.05)" },
  { key: "stress", emoji: "😤", label: "壓力", unit: "/5", color: "#EF4444", bgColor: "rgba(239,68,68,0.05)" },
];

/** 環境標籤（每日脈絡） */
export const CONTEXT_TAGS = ["在家", "圖書館", "咖啡廳", "辦公室", "通勤", "早起", "晚睡", "社交"] as const;

/** 打卡標籤 pool（mock 打卡用，對齊真實打卡的 tags 欄位語意） */
export const CHECKIN_TAGS = ["專注", "有收穫", "卡關", "突破", "複習", "實作", "討論", "看影片"] as const;

/** 自訂追蹤欄位示意（原泛用指標移到這裡作概念展示，不實作儲存） */
export const CUSTOM_FIELD_EXAMPLES = [
  { emoji: "☕", label: "咖啡杯數" },
  { emoji: "👟", label: "步數" },
  { emoji: "💰", label: "花費" },
  { emoji: "💧", label: "喝水" },
  { emoji: "📖", label: "閱讀頁數" },
  { emoji: "🧘", label: "冥想時間" },
] as const;

export const CONNECTED_SERVICES: ConnectedService[] = [
  { id: "apple-health", name: "Apple Health", emoji: "🍎", connected: false },
  { id: "strava", name: "Strava", emoji: "🏃", connected: false },
  { id: "google-cal", name: "Google Cal", emoji: "📅", connected: false },
  { id: "github", name: "GitHub", emoji: "💻", connected: false },
  { id: "notion", name: "Notion", emoji: "📝", connected: false },
  { id: "bank-csv", name: "Bank CSV", emoji: "🏦", connected: false },
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

export const PERIOD_OPTIONS = [7, 30, 90] as const;
export type PeriodOption = (typeof PERIOD_OPTIONS)[number];
