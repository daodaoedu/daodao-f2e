import { format, subDays } from "date-fns";
import { PRESET_TAGS } from "./constants";
import type { Correlation, DailyRecord } from "./types";

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

function generateDailyRecord(dateStr: string, _dayIndex: number): DailyRecord {
  const seed = seedRandom(dateStr);
  const dayOfWeek = new Date(dateStr).getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  const baseExercise = isWeekend ? 60 : 20;
  const exercise = Math.round(seededValue(seed + 1, baseExercise * 0.3, baseExercise * 2.5));
  const exerciseBoost = Math.min(exercise / 120, 1) * 2;

  const sleep = Number(seededValue(seed + 2, 5, 9).toFixed(1));
  const sleepBoost = sleep > 7 ? 1 : sleep < 6 ? -1 : 0;

  const coffee = Math.round(seededValue(seed + 3, 0, 4));
  const coffeeEffect = coffee > 2 ? -0.3 : 0;

  const baseMood = isWeekend ? 6.5 : 5.5;
  const mood = Math.max(
    1,
    Math.min(
      9,
      Math.round(
        baseMood + exerciseBoost + sleepBoost + coffeeEffect + seededValue(seed + 4, -1.5, 1.5)
      )
    )
  );

  const energy = Math.max(
    1,
    Math.min(9, Math.round(5 + sleepBoost + exerciseBoost * 0.5 + seededValue(seed + 5, -1.5, 1.5)))
  );

  const baseSteps = isWeekend ? 9000 : 6000;
  const steps = Math.round(seededValue(seed + 6, baseSteps * 0.4, baseSteps * 1.8));

  const focus = Number(seededValue(seed + 7, 2, 8).toFixed(1));
  const spend = Math.round(seededValue(seed + 8, 100, 800));
  const stress = Math.max(1, Math.min(5, Math.round(seededValue(seed + 9, 1, 5))));
  const water = Math.round(seededValue(seed + 10, 3, 10));
  const heartRate = Math.round(seededValue(seed + 11, 55, 80));

  const tagCount = Math.round(seededValue(seed + 12, 1, 5));
  const shuffled = [...PRESET_TAGS].sort(
    (a, b) => seedRandom(a + dateStr) - seedRandom(b + dateStr)
  );
  const tags = shuffled.slice(0, tagCount);

  const notes = [
    "",
    "",
    "",
    "攀岩日，最高完攀 5.11b。很棒的一天",
    "有點低落",
    "去福隆衝浪。很棒的一天",
    "專注做 side project，效率很高",
    "跟朋友吃飯聊天，心情很好",
    "讀完《原子習慣》，很有收穫",
    "早起跑步 5K",
    "",
  ];
  const noteIdx = Math.round(seededValue(seed + 13, 0, notes.length - 1));
  const note = notes[noteIdx] ?? "";

  return {
    date: dateStr,
    mood,
    energy,
    sleep,
    steps,
    focus,
    exercise,
    coffee,
    spend,
    stress,
    water,
    heartRate,
    tags,
    note,
    intention: "",
    reflection: "",
    source: {
      mood: "manual",
      energy: "manual",
      sleep: "mock",
      steps: "mock",
      focus: "manual",
      exercise: "mock",
      coffee: "manual",
      spend: "manual",
      stress: "manual",
      water: "manual",
      heartRate: "mock",
    },
  };
}

export function generateMockRecords(days: number = 90): Record<string, DailyRecord> {
  const records: Record<string, DailyRecord> = {};
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const date = subDays(today, i);
    const dateStr = format(date, "yyyy-MM-dd");
    records[dateStr] = generateDailyRecord(dateStr, i);
  }
  return records;
}

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
    points.push({
      x: Math.round(x),
      y: Math.max(10, Math.min(70, Math.round(y))),
    });
  }
  return points;
}

export const MOCK_CORRELATIONS: Correlation[] = [
  {
    id: "exercise-mood",
    metricA: { key: "exercise", emoji: "💪", label: "運動時間" },
    metricB: { key: "mood", emoji: "😊", label: "心情" },
    rValue: 0.52,
    strength: "strong",
    direction: "positive",
    description: "💪 運動時間較高時，😊 心情傾向較高",
    scatterData: generateScatterData(42, 24, 0.52),
  },
  {
    id: "coffee-sleep",
    metricA: { key: "coffee", emoji: "☕", label: "咖啡" },
    metricB: { key: "sleep", emoji: "😴", label: "睡眠" },
    rValue: -0.31,
    strength: "moderate",
    direction: "negative",
    description: "☕ 咖啡較高時，😴 睡眠傾向較低",
    scatterData: generateScatterData(77, 24, -0.31),
  },
  {
    id: "tag-climbing-mood",
    metricA: { key: "tag:攀岩", emoji: "🏷️", label: "#攀岩" },
    metricB: { key: "mood", emoji: "😊", label: "心情" },
    rValue: 0.48,
    strength: "strong",
    direction: "positive",
    description: "🏷️ #攀岩 的日子，😊 心情傾向較高",
  },
  {
    id: "sleep-energy",
    metricA: { key: "sleep", emoji: "😴", label: "睡眠品質" },
    metricB: { key: "energy", emoji: "🔋", label: "精力" },
    rValue: 0.34,
    strength: "moderate",
    direction: "positive",
    description: "😴 睡眠品質較高時，🔋 精力傾向較高",
  },
  {
    id: "stress-sleep",
    metricA: { key: "stress", emoji: "😤", label: "壓力" },
    metricB: { key: "sleep", emoji: "😴", label: "睡眠品質" },
    rValue: -0.19,
    strength: "weak",
    direction: "negative",
    description: "😤 壓力較高時，😴 睡眠品質傾向較低",
  },
  {
    id: "tag-earlyrise-focus",
    metricA: { key: "tag:早起", emoji: "🏷️", label: "#早起" },
    metricB: { key: "focus", emoji: "🎯", label: "專注時數" },
    rValue: 0.29,
    strength: "moderate",
    direction: "positive",
    description: "🏷️ #早起 的日子，🎯 專注時數傾向較高",
  },
  {
    id: "focus-tasks",
    metricA: { key: "focus", emoji: "🎯", label: "專注時數" },
    metricB: { key: "mood", emoji: "✅", label: "完成任務" },
    rValue: 0.18,
    strength: "weak",
    direction: "positive",
    description: "🎯 專注時數較高時，✅ 完成任務傾向較高",
  },
  {
    id: "alcohol-focus",
    metricA: { key: "coffee", emoji: "🍺", label: "酒精" },
    metricB: { key: "focus", emoji: "🎯", label: "專注時數" },
    rValue: -0.27,
    strength: "moderate",
    direction: "negative",
    description: "🍺 酒精較高時，🎯 專注時數傾向較低（隔日）",
  },
];
