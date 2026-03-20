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

  const { activePractices, completedPractices, todayPending, todayCompleted } = useMemo(() => {
    const active = rawPractices.filter((p) =>
      ["draft", "not_started", "active"].includes(p.status)
    );
    const completed = rawPractices.filter((p) => p.status === "completed");
    const pending = active.filter((p) => !isTodayCheckedIn(p.lastCheckinAt ?? undefined));
    const done = active.filter((p) => isTodayCheckedIn(p.lastCheckinAt ?? undefined));
    return {
      activePractices: active.map(toCardPractice),
      completedPractices: completed.map(toCardPractice),
      todayPending: pending.map(toCardPractice),
      todayCompleted: done.map(toCardPractice),
    };
  }, [rawPractices]);

  return {
    practices: rawPractices.map(toCardPractice),
    activePractices,
    completedPractices,
    todayPending,
    todayCompleted,
    isLoading,
    error,
    mutate,
  };
}
