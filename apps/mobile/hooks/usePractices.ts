import {
  createPracticeCheckIn,
  getPracticeById,
  getPracticeCheckIns,
  useMutate,
  useMyPracticeStats,
  useMyPractices,
} from "@daodao/api";
import { useCallback, useMemo, useRef, useState } from "react";
import useSWR, { mutate as globalMutate } from "swr";
import { PracticeStatus } from "@/constants/practice-status";
import type { TaskStatus } from "@/constants/task-status";
import { mapPracticeStatusToTaskStatus } from "@/constants/task-status";
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

// ============================================================================
// Hooks
// ============================================================================

type ApiPracticeDetail = IApiPractice & {
  durationDays?: number;
  frequencyMinDays?: number;
  frequencyMaxDays?: number;
  createdAt?: string;
  updatedAt?: string;
};

type ApiCheckIn = {
  id: string | number;
  practiceId: string | number;
  note?: string;
  createdAt: string;
};

type ApiMutationResult = {
  error?: unknown;
};

const mapPracticeDetail = (practice: ApiPracticeDetail | undefined): IPractice | undefined => {
  if (!practice) return undefined;

  const targetDays = practice.durationDays ?? 0;
  const completedDays = practice.checkInCount ?? 0;

  return {
    id: practice.id,
    title: practice.title,
    description: practice.description ?? practice.practiceAction,
    frequency:
      practice.frequencyMinDays === 1 && practice.frequencyMaxDays === 1 ? "daily" : "custom",
    targetDays,
    completedDays,
    currentStreak: 0,
    longestStreak: 0,
    status: mapPracticeStatusToTaskStatus(practice.status as PracticeStatus),
    practiceStatus:
      practice.status === PracticeStatus.active ||
      practice.status === PracticeStatus.completed ||
      practice.status === PracticeStatus.archived
        ? practice.status
        : undefined,
    tags: practice.tags ?? [],
    color: practice.themeColor,
    createdAt: practice.createdAt ?? "",
    updatedAt: practice.updatedAt ?? practice.createdAt ?? "",
    lastCheckInAt: practice.lastCheckinAt ?? undefined,
    todayCheckedIn:
      practice.lastCheckinAt?.split("T")[0] === new Date().toISOString().split("T")[0],
  };
};

const mapCheckIn = (checkIn: ApiCheckIn): ICheckIn => ({
  id: String(checkIn.id),
  practiceId: String(checkIn.practiceId),
  note: checkIn.note,
  createdAt: checkIn.createdAt,
});

const getMutationErrorMessage = (response: ApiMutationResult): string | null => {
  if (!response.error) return null;

  if (response.error instanceof Error) return response.error.message;
  if (typeof response.error === "string") return response.error;
  if (typeof response.error === "object" && "message" in response.error) {
    const message = response.error.message;
    if (typeof message === "string") return message;
  }

  return "打卡失敗，請稍後再試";
};

export function usePractices() {
  const {
    data: practicesData,
    error: practicesError,
    isLoading: practicesLoading,
    mutate,
  } = useMyPractices({ limit: 16 });

  const { data: statsData, isLoading: statsLoading } = useMyPracticeStats();

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
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/v1/practices/${id}` : null,
    () => getPracticeById(id as string),
    {
      revalidateOnFocus: false,
      errorRetryCount: 2,
    }
  );
  const practice = useMemo(() => mapPracticeDetail(data?.data?.data), [data]);

  return {
    practice,
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
  const { data, error, isLoading, mutate } = useSWR(
    practiceId ? `/api/v1/practices/${practiceId}/checkins` : null,
    () => getPracticeCheckIns(practiceId as string),
    {
      revalidateOnFocus: false,
      errorRetryCount: 2,
    }
  );

  const checkIns = useMemo(() => (data?.data?.data ?? []).map(mapCheckIn), [data]);

  const checkInDates = useMemo(() => {
    return checkIns.map((checkIn) => checkIn.createdAt.split("T")[0]);
  }, [checkIns]);

  return {
    checkIns,
    checkInDates,
    isLoading,
    error,
    mutate,
  };
}

export function useCheckIn() {
  const [isChecking, setIsChecking] = useState(false);
  const isCheckingRef = useRef(false);
  const mutate = useMutate();

  const checkIn = useCallback(
    async ({ practiceId, note }: ICheckInParams): Promise<ICheckInResult> => {
      if (isCheckingRef.current) {
        return { success: false, error: "正在處理中" };
      }

      isCheckingRef.current = true;
      setIsChecking(true);

      try {
        const response = await createPracticeCheckIn(practiceId, {
          note,
          imageUrls: [],
          tags: [],
        });
        const errorMessage = getMutationErrorMessage(response);
        if (errorMessage) {
          throw new Error(errorMessage);
        }

        await Promise.all([
          mutate([
            "/api/v1/practices/{id}/checkins",
            {
              params: {
                path: { id: practiceId },
                query: {},
              },
            },
          ] as const),
          mutate([
            "/api/v1/practices/{id}",
            {
              params: {
                path: { id: practiceId },
              },
            },
          ] as const),
          mutate([
            "/api/v1/me/practices",
            {
              params: {
                query: {},
              },
            },
          ] as const),
          mutate([
            "/api/v1/me/practice-stats",
            {
              params: {
                query: {},
              },
            },
          ] as const),
          globalMutate(`/api/v1/practices/${practiceId}`),
          globalMutate(`/api/v1/practices/${practiceId}/checkins`),
        ]);
        return { success: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : "打卡失敗，請稍後再試";
        return { success: false, error: message };
      } finally {
        isCheckingRef.current = false;
        setIsChecking(false);
      }
    },
    [mutate]
  );

  return { checkIn, isChecking };
}
