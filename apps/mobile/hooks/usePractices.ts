import { useCallback, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { PracticeStatus } from "@/constants/practice-status";
import type { TaskStatus } from "@/constants/task-status";
import { mapPracticeStatusToTaskStatus } from "@/constants/task-status";
import { api } from "@/services/api-client";
import type { ICheckIn, IPractice } from "@/types/practice";

// ============================================================================
// Types — aligned with product's API response
// ============================================================================

export interface IInProgressTask {
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

export interface ICompletedTask {
  id: string;
  label: string;
  title: string;
  description: string;
  viewCount: number;
  commentCount: number;
  tags: string[];
}

// API response types (aligned with /api/v1/me/practices)
interface IApiPractice {
  id: string;
  title: string;
  practiceAction?: string;
  description?: string;
  status: string;
  checkInCount: number;
  progressPercentage?: number;
  themeColor?: string;
  tags?: string[];
  lastCheckinAt?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

interface IMyPracticesResponse {
  data: IApiPractice[];
}

interface IPracticeStatsResponse {
  data: {
    currentStreak?: number;
    totalCheckIns?: number;
  };
}

// ============================================================================
// Hooks
// ============================================================================

const MY_PRACTICES_KEY = "/me/practices";
const MY_PRACTICE_STATS_KEY = "/me/practice-stats";

export function usePractices() {
  const {
    data: practicesData,
    error: practicesError,
    isLoading: practicesLoading,
    mutate,
  } = useSWR<IMyPracticesResponse>(
    MY_PRACTICES_KEY,
    () => api.get<IMyPracticesResponse>(`${MY_PRACTICES_KEY}?limit=16`),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 10000,
      errorRetryCount: 3,
      errorRetryInterval: 1000,
    }
  );

  const { data: statsData, isLoading: statsLoading } = useSWR<IPracticeStatsResponse>(
    MY_PRACTICE_STATS_KEY,
    () => api.get<IPracticeStatsResponse>(MY_PRACTICE_STATS_KEY),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 10000,
    }
  );

  const practices = practicesData?.data ?? [];

  const { inProgressTasks, completedTasks } = useMemo(() => {
    const inProgressTasksData: IInProgressTask[] = [];
    const completedTasksData: ICompletedTask[] = [];

    for (const practice of practices) {
      const isInProgress =
        practice.status === PracticeStatus.active ||
        practice.status === PracticeStatus.draft ||
        practice.status === PracticeStatus.notStarted;

      const lastCheckInDate = practice.lastCheckinAt ?? null;

      if (isInProgress) {
        inProgressTasksData.push({
          id: practice.id,
          label: "主題實踐",
          title: practice.title,
          description: practice.practiceAction || "",
          checkInCount: practice.checkInCount,
          progress: practice.progressPercentage ?? 0,
          messagesCount: 0,
          isUnreadMessages: false,
          theme: practice.themeColor || "#FCDD84",
          status: mapPracticeStatusToTaskStatus(practice.status as PracticeStatus),
          lastCheckInDate,
          startDate: practice.startDate || null,
          endDate: practice.endDate || null,
        });
      } else if (practice.status === PracticeStatus.completed) {
        completedTasksData.push({
          id: practice.id,
          label: "主題實踐",
          title: practice.title,
          description: practice.practiceAction || "",
          viewCount: 0,
          commentCount: 0,
          tags: practice.tags || [],
        });
      }
    }

    return { inProgressTasks: inProgressTasksData, completedTasks: completedTasksData };
  }, [practices]);

  const stats = useMemo(() => {
    const s = statsData?.data;
    return {
      currentStreak: s?.currentStreak || 0,
      totalCheckIns: s?.totalCheckIns || 0,
    };
  }, [statsData]);

  return {
    practices,
    inProgressTasks,
    completedTasks,
    stats,
    isLoading: practicesLoading || statsLoading,
    error: practicesError,
    mutate,
  };
}

export function usePractice(id: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR<IPractice>(
    id ? `/practices/${id}` : null,
    () => api.get<IPractice>(`/practices/${id}`),
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

interface ICheckInParams {
  practiceId: string;
  note?: string;
}

interface ICheckInResult {
  success: boolean;
  error?: string;
}

export function useCheckIns(practiceId: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR<ICheckIn[]>(
    practiceId ? `/practices/${practiceId}/check-ins` : null,
    () => api.get<ICheckIn[]>(`/practices/${practiceId}/check-ins`),
    {
      revalidateOnFocus: false,
      errorRetryCount: 2,
    }
  );

  const checkInDates = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    return data.map((checkIn: { createdAt: string }) => checkIn.createdAt.split("T")[0]);
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
    async ({ practiceId, note }: ICheckInParams): Promise<ICheckInResult> => {
      if (isCheckingRef.current) {
        return { success: false, error: "正在處理中" };
      }

      isCheckingRef.current = true;
      setIsChecking(true);

      try {
        await api.post(`/practices/${practiceId}/check-in`, { note });
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
