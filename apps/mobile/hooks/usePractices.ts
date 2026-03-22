import { useCallback, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { api } from "@/services/api-client";
import type { CheckIn, Practice, PracticeStats, PracticesResponse } from "@/types/practice";
import { mapPracticeStatusToTaskStatus } from "@/constants/task-status";
import type { TaskStatus } from "@/constants/task-status";
import type { PracticeStatus } from "@/constants/practice-status";

export interface InProgressTask {
  id: string;
  label: string;
  title: string;
  description: string;
  checkInCount: number;
  progress: number;
  messagesCount: number;
  isUnreadMessages: boolean;
  theme: string;
  status: TaskStatus;
  lastCheckInDate?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

export interface CompletedTask {
  id: string;
  label: string;
  title: string;
  description: string;
  viewCount: number;
  commentCount: number;
  tags: string[];
}

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

  const { inProgressTasks, completedTasks } = useMemo(() => {
    const inProgressTasksData: InProgressTask[] = [];
    const completedTasksData: CompletedTask[] = [];

    for (const practice of practices) {
      const taskStatus = mapPracticeStatusToTaskStatus(practice.status as PracticeStatus);
      const isCompleted = taskStatus === "completed";

      if (!isCompleted) {
        inProgressTasksData.push({
          id: practice.id,
          label: "主題實踐",
          title: practice.title,
          description: practice.description || "",
          checkInCount: practice.completedDays || 0,
          progress: practice.targetDays
            ? Math.round((practice.completedDays / practice.targetDays) * 100)
            : 0,
          messagesCount: 0,
          isUnreadMessages: false,
          theme: practice.theme || "yellow",
          status: taskStatus,
          lastCheckInDate: null,
          startDate: practice.createdAt || null,
          endDate: null,
        });
      } else {
        completedTasksData.push({
          id: practice.id,
          label: "主題實踐",
          title: practice.title,
          description: practice.description || "",
          viewCount: 0,
          commentCount: 0,
          tags: practice.tags || [],
        });
      }
    }

    return { inProgressTasks: inProgressTasksData, completedTasks: completedTasksData };
  }, [practices]);

  return {
    practices,
    activePractices,
    completedPractices,
    todayPending,
    todayCompleted,
    inProgressTasks,
    completedTasks,
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
