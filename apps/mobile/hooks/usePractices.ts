import { useCallback, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { api } from "@/services/api-client";
import type { CheckIn, Practice, PracticeStats, PracticesResponse } from "@/types/practice";

const PRACTICES_KEY = "/practices";

async function fetchPractices(): Promise<PracticesResponse> {
  return api.get<PracticesResponse>(PRACTICES_KEY);
}

const defaultStats: PracticeStats = {
  totalPractices: 0,
  activePractices: 0,
  completedToday: 0,
  totalToday: 0,
  currentStreak: 0,
  totalCheckIns: 0,
};

export function usePractices() {
  const { data, error, isLoading, mutate } = useSWR<PracticesResponse>(
    PRACTICES_KEY,
    fetchPractices,
    {
      revalidateOnFocus: false, // 避免過度 revalidation
      revalidateOnReconnect: true,
      dedupingInterval: 10000, // 10 秒內不重複請求
      errorRetryCount: 3,
      errorRetryInterval: 1000,
    }
  );

  const practices = data?.practices ?? [];
  const stats = data?.stats ?? defaultStats;

  // 使用 useMemo 避免每次 render 都重新計算
  const { activePractices, completedPractices, todayPending, todayCompleted } = useMemo(() => {
    // 進行中的實踐 (包含 draft, not-started, in-progress, active)
    const activeStatuses = ["draft", "not-started", "in-progress", "active"];
    const active = practices.filter((p) => activeStatuses.includes(p.status));

    // 已完成的實踐
    const completed = practices.filter((p) => p.status === "completed" || p.isCompleted);

    const pending = active.filter((p) => !p.todayCheckedIn);
    const done = active.filter((p) => p.todayCheckedIn);

    return {
      activePractices: active,
      completedPractices: completed,
      todayPending: pending,
      todayCompleted: done,
    };
  }, [practices]);

  return {
    practices,
    activePractices,
    completedPractices,
    todayPending,
    todayCompleted,
    stats,
    isLoading,
    error,
    mutate,
  };
}

export function usePractice(id: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR<Practice>(
    id ? `/practices/${id}` : null,
    () => api.get<Practice>(`/practices/${id}`),
    {
      revalidateOnFocus: false,
      errorRetryCount: 2,
    }
  );

  return {
    practice: data,
    isLoading,
    error,
    mutate,
  };
}

interface CheckInParams {
  practiceId: string;
  note?: string;
}

interface CheckInResult {
  success: boolean;
  error?: string;
}

export function useCheckIns(practiceId: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR<CheckIn[]>(
    practiceId ? `/practices/${practiceId}/check-ins` : null,
    () => api.get<CheckIn[]>(`/practices/${practiceId}/check-ins`),
    {
      revalidateOnFocus: false,
      errorRetryCount: 2,
    }
  );

  // 轉換為日曆所需的日期格式 (YYYY-MM-DD)
  const checkInDates = useMemo(() => {
    if (!data) return [];
    return data.map((checkIn) => checkIn.createdAt.split("T")[0]);
  }, [data]);

  return {
    checkIns: data ?? [],
    checkInDates,
    isLoading,
    error,
    mutate,
  };
}

export function useCheckIn() {
  const [isChecking, setIsChecking] = useState(false);
  const isCheckingRef = useRef(false);
  const { mutate: mutatePractices } = usePractices();

  const checkIn = useCallback(
    async ({ practiceId, note }: CheckInParams): Promise<CheckInResult> => {
      if (isCheckingRef.current) {
        return { success: false, error: "正在處理中" };
      }

      isCheckingRef.current = true;
      setIsChecking(true);

      try {
        await api.post(`/practices/${practiceId}/check-in`, { note });

        // 成功後才更新資料
        await mutatePractices();

        return { success: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : "打卡失敗，請稍後再試";
        return { success: false, error: message };
      } finally {
        isCheckingRef.current = false;
        setIsChecking(false);
      }
    },
    [mutatePractices]
  );

  return { checkIn, isChecking };
}
