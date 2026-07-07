import { HappySvg } from "@daodao/assets";
import { format, subDays } from "date-fns";
import {
  Battery,
  BookOpen,
  Brain,
  CheckCircle,
  Dumbbell,
  Moon,
  Sunrise,
  Target,
} from "lucide-react";
import { CHECKIN_TAGS, CONTEXT_TAGS } from "./constants";
import type { CheckinMood, Correlation, DailyRecord, Insight, MockCheckin } from "./types";

function seedRandom(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededValue(seed: number, min: number, max: number): number {
  const normalized = ((seed * 9301 + 49297) % 233280) / 233280;
  return min + normalized * (max - min);
}

export const MOCK_PRACTICES = [
  { id: "jlpt-n3", title: "日檢 N3 備考衝刺" },
  { id: "neuro-book", title: "《神經可塑性》共讀" },
  { id: "half-marathon", title: "半馬完賽訓練" },
] as const;

const CHECKIN_NOTES = [
  "聽力練了 3 回，語速終於跟上一點了",
  "讀完第 4 章，神經元用進廢退真的有感",
  "今天只有 20 分鐘，做了一回單字題。少但沒斷",
  "跑了 8K，配速 6:10，比上週穩",
  "文法藍寶書第 12 章，「〜わけではない」搞懂了",
  "在圖書館待了一下午，效率超高",
  "有點累，但還是完成了今天的進度",
  "跟讀書會討論完，觀點被打開",
];

const MOOD_POOL: CheckinMood[] = [
  "happy",
  "good",
  "good",
  "neutral",
  "happy",
  "frustrated",
  "good",
  "neutral",
  "bored",
  "happy",
];

/**
 * 產生過去 days 天的 mock 打卡。
 * 今天刻意不產生（保留給使用者體驗打卡動線）；昨天起往回 6 天必有打卡，
 * 讓使用者今天打卡後 streak 達 7 → 島景出現彩虹。
 */
export function generateMockCheckins(days = 90): MockCheckin[] {
  const checkins: MockCheckin[] = [];
  const today = new Date();
  for (let i = 1; i < days; i++) {
    const dateStr = format(subDays(today, i), "yyyy-MM-dd");
    const seed = seedRandom(dateStr);
    const hasCheckin = i <= 6 || seededValue(seed, 0, 1) < 0.72;
    if (!hasCheckin) continue;
    const count = seededValue(seed + 1, 0, 1) < 0.25 ? 2 : 1;
    for (let j = 0; j < count; j++) {
      const practiceIdx =
        Math.floor(seededValue(seed + j * 3, 0, MOCK_PRACTICES.length)) % MOCK_PRACTICES.length;
      const practice = MOCK_PRACTICES[practiceIdx] ?? MOCK_PRACTICES[0];
      const mood =
        MOOD_POOL[
          Math.floor(seededValue(seed + j * 7 + 2, 0, MOOD_POOL.length)) % MOOD_POOL.length
        ] ?? "good";
      const note =
        CHECKIN_NOTES[
          Math.floor(seededValue(seed + j * 11 + 5, 0, CHECKIN_NOTES.length)) % CHECKIN_NOTES.length
        ] ?? "";
      const tagCount = Math.round(seededValue(seed + j * 13 + 8, 1, 3));
      const shuffled = [...CHECKIN_TAGS].sort(
        (a, b) => seedRandom(a + dateStr) - seedRandom(b + dateStr)
      );
      checkins.push({
        id: `mock-${dateStr}-${j}`,
        practiceId: practice.id,
        practiceTitle: practice.title,
        checkinDate: dateStr,
        mood,
        note,
        tags: shuffled.slice(0, tagCount),
      });
    }
  }
  return checkins;
}

function generateDailyRecord(dateStr: string): DailyRecord {
  const seed = seedRandom(dateStr);
  const sleep = Number(seededValue(seed + 2, 5, 8.5).toFixed(1));
  let sleepBoost = 0;
  if (sleep >= 7) sleepBoost = 1;
  if (sleep < 6) sleepBoost = -1;
  const energy = Math.max(
    1,
    Math.min(5, Math.round(3 + sleepBoost + seededValue(seed + 5, -1, 1)))
  );
  const tagCount = Math.round(seededValue(seed + 12, 1, 3));
  const shuffled = [...CONTEXT_TAGS].sort(
    (a, b) => seedRandom(a + dateStr) - seedRandom(b + dateStr)
  );
  const contextTags = shuffled.slice(0, tagCount);
  const focusBoost = contextTags.includes("圖書館") || contextTags.includes("早起") ? 1 : 0;
  const focus = Math.max(1, Math.min(5, Math.round(3 + focusBoost + seededValue(seed + 7, -1, 1))));
  const exercise = Math.round(seededValue(seed + 1, 0, 90));
  const stress = Math.max(1, Math.min(5, Math.round(seededValue(seed + 9, 1, 5))));
  return {
    date: dateStr,
    energy,
    sleep,
    focus,
    exercise,
    stress,
    contextTags,
    note: "",
    source: { energy: "mock", sleep: "mock", focus: "mock", exercise: "mock", stress: "mock" },
  };
}

/** 過去 days 天（不含今天）的每日脈絡；今天由使用者在「今天」tab 記錄 */
export function generateMockRecords(days = 90): Record<string, DailyRecord> {
  const records: Record<string, DailyRecord> = {};
  const today = new Date();
  for (let i = 1; i < days; i++) {
    const dateStr = format(subDays(today, i), "yyyy-MM-dd");
    records[dateStr] = generateDailyRecord(dateStr);
  }
  return records;
}

/** 精選洞察卡（第二層）— POC 寫死，文案全為學習語境 */
export const MOCK_INSIGHTS: Insight[] = [
  {
    id: "library-focus",
    icon: BookOpen,
    conclusion: "在 #圖書館 的日子，你的專注品質平均高 40%",
    detail: "過去 30 天有 8 天在圖書館，專注品質平均 4.2/5；其他日子平均 3.0/5。",
    drillDown: "correlations",
  },
  {
    id: "sleep-checkin",
    icon: Moon,
    conclusion: "睡滿 7 小時的隔天，你的打卡率高 1.8 倍",
    detail: "睡眠充足的隔日打卡率 86%，不足時只有 48%。休息也是學習的一部分。",
    drillDown: "trends",
  },
  {
    id: "morning-mood",
    icon: Sunrise,
    conclusion: "#早起 的日子，打卡心情明顯更好",
    detail: "早起日的打卡心情多為「開心」「不錯」，出現頻率比其他日子明顯更高。",
    drillDown: "days",
  },
];

function generateScatterData(
  seed: number,
  count: number,
  correlation: number
): Array<{ x: number; y: number }> {
  const points: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < count; i++) {
    const x = seededValue(seed + i * 7, 20, 160);
    const noise = seededValue(seed + i * 13 + 99, -30, 30) * (1 - Math.abs(correlation));
    const y =
      correlation > 0
        ? 70 - (x - 20) * 0.35 * correlation + noise
        : 20 + (x - 20) * 0.35 * Math.abs(correlation) + noise;
    points.push({ x: Math.round(x), y: Math.max(10, Math.min(70, Math.round(y))) });
  }
  return points;
}

/** 學習語境的相關性（第三層下鑽） */
export const LEARNING_CORRELATIONS: Correlation[] = [
  {
    id: "library-focus",
    metricA: { key: "tag:圖書館", icon: BookOpen, label: "#圖書館" },
    metricB: { key: "focus", icon: Target, label: "專注品質" },
    rValue: 0.44,
    strength: "strong",
    direction: "positive",
    description: "#圖書館 的日子，專注品質傾向較高",
    scatterData: generateScatterData(42, 24, 0.44),
  },
  {
    id: "exercise-mood",
    metricA: { key: "exercise", icon: Dumbbell, label: "運動" },
    metricB: { key: "checkinMood", icon: HappySvg, label: "打卡心情" },
    rValue: 0.52,
    strength: "strong",
    direction: "positive",
    description: "有運動的日子，打卡心情傾向較好",
    scatterData: generateScatterData(77, 24, 0.52),
  },
  {
    id: "energy-focus",
    metricA: { key: "energy", icon: Battery, label: "精力" },
    metricB: { key: "focus", icon: Target, label: "專注品質" },
    rValue: 0.41,
    strength: "strong",
    direction: "positive",
    description: "精力較高時，專注品質傾向較高",
  },
  {
    id: "sleep-checkin",
    metricA: { key: "sleep", icon: Moon, label: "睡眠" },
    metricB: { key: "checkinRate", icon: CheckCircle, label: "打卡率" },
    rValue: 0.38,
    strength: "moderate",
    direction: "positive",
    description: "睡眠較充足的隔天，打卡率傾向較高",
  },
  {
    id: "earlyrise-focus",
    metricA: { key: "tag:早起", icon: Sunrise, label: "#早起" },
    metricB: { key: "focus", icon: Target, label: "專注品質" },
    rValue: 0.29,
    strength: "moderate",
    direction: "positive",
    description: "#早起 的日子，專注品質傾向較高",
  },
  {
    id: "stress-focus",
    metricA: { key: "stress", icon: Brain, label: "壓力" },
    metricB: { key: "focus", icon: Target, label: "專注品質" },
    rValue: -0.31,
    strength: "moderate",
    direction: "negative",
    description: "壓力較高時，專注品質傾向較低",
  },
];
