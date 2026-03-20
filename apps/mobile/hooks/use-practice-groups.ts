// apps/mobile/hooks/use-practice-groups.ts
import { useMemo } from "react";
import { useMyPractices } from "@daodao/api";
import type { components } from "@daodao/api/src/types";
import type { CombinedStatus, Practice } from "@/types/practice";

type MyPracticeItem = components["schemas"]["MyPracticeItem"];

// Task 5a 會擴充此檔案加入 computeStreaks
export function isTodayCheckedIn(lastCheckinAt?: string | null): boolean {
  if (!lastCheckinAt) return false;
  const today = new Date().toISOString().split("T")[0];
  return lastCheckinAt.split("T")[0] === today;
}

export function computeStreaks(sortedDates: string[]): {
  currentStreak: number;
  longestStreak: number;
} {
  if (sortedDates.length === 0) return { currentStreak: 0, longestStreak: 0 };

  // 統一排序：最新在前（dates 是 YYYY-MM-DD 字串）
  const dates = [...new Set(sortedDates)].sort().reverse();

  // 用 Date 物件計算今天和昨天，避免時區與 DST 問題
  const todayDate = new Date();
  const yesterdayDate = new Date(todayDate);
  yesterdayDate.setDate(todayDate.getDate() - 1);
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const today = fmt(todayDate);
  const yesterday = fmt(yesterdayDate);

  // 若最近打卡不是今天或昨天，currentStreak = 0
  const streakIsActive = dates[0] === today || dates[0] === yesterday;

  let currentStreak = streakIsActive ? 1 : 0;
  let longestStreak = 1;
  let streak = 1;
  // currentStreak 只計算從最新日期開始的連續段（一旦中斷就停止累加）
  let currentStreakEnded = !streakIsActive;

  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diff = Math.round((prev.getTime() - curr.getTime()) / 86400000);
    if (diff === 1) {
      streak++;
      if (!currentStreakEnded) currentStreak++;
    } else {
      longestStreak = Math.max(longestStreak, streak);
      streak = 1;
      currentStreakEnded = true; // 最新連續段已結束，後面不再累加 currentStreak
    }
  }
  longestStreak = Math.max(longestStreak, streak);

  return { currentStreak, longestStreak };
}

/** 將 list API 的 MyPracticeItem 轉換為本地 Practice 型別供 PracticeCard 使用 */
function toCardPractice(p: MyPracticeItem): Practice {
  // API 使用 "not_started"（底線）；本地 CombinedStatus 包含 "not-started"（連字號）
  const status: CombinedStatus =
    p.status === "not_started" ? "not-started" : (p.status as CombinedStatus);

  return {
    id: p.id,
    title: p.title,
    description: p.practiceAction,
    frequency: "daily", // list API 未提供；預設 "daily"
    targetDays: p.durationDays ?? 0,
    completedDays: p.checkInCount,
    currentStreak: 0,  // list API 無 streak；打卡後 mutate 刷新
    longestStreak: 0,
    status,
    tags: p.tags,
    color: p.themeColor,
    isCompleted: p.status === "completed",
    createdAt: p.createdAt,
    updatedAt: p.updatedAt ?? p.createdAt,
    todayCheckedIn: isTodayCheckedIn(p.lastCheckinAt),
  };
}

export function usePracticeGroups() {
  const { data, isLoading, error, mutate } = useMyPractices();

  const rawPractices: MyPracticeItem[] = data?.data ?? [];

  const { practices, activePractices, completedPractices, todayPending, todayCompleted } = useMemo(() => {
    const active = rawPractices.filter((p) =>
      ["draft", "not_started", "active"].includes(p.status)
    );
    const completed = rawPractices.filter((p) => p.status === "completed");
    const pending = active.filter((p) => !isTodayCheckedIn(p.lastCheckinAt ?? undefined));
    const done = active.filter((p) => isTodayCheckedIn(p.lastCheckinAt ?? undefined));
    return {
      practices: rawPractices.map(toCardPractice),
      activePractices: active.map(toCardPractice),
      completedPractices: completed.map(toCardPractice),
      todayPending: pending.map(toCardPractice),
      todayCompleted: done.map(toCardPractice),
    };
  }, [rawPractices]);

  return {
    practices,
    activePractices,
    completedPractices,
    todayPending,
    todayCompleted,
    isLoading,
    error,
    mutate,
  };
}
