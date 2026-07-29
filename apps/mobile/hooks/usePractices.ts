import {
  createPracticeCheckInWithFormData,
  extractApiErrorMessage,
  getPracticeById,
  getPracticeCheckIns,
  useMutate,
  useMyPracticeStats,
  useMyPractices,
} from "@daodao/api";
import { useCallback, useMemo, useRef, useState } from "react";
import useSWR, { mutate as globalMutate } from "swr";
import { type MoodType, mapMoodTypeToApiMood } from "@/constants/mood";
import { PracticeStatus } from "@/constants/practice-status";
import type { TaskStatus } from "@/constants/task-status";
import { mapPracticeStatusToTaskStatus } from "@/constants/task-status";
import { applyOnboardingUpdateFromResponse } from "@/hooks/useOnboardingProgress";
import type { ICheckIn, IPractice } from "@/types/practice";
import { createReactNativeFormDataFile } from "@/utils/form-data-file";

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
  sessionDurationMinutes?: number;
  practiceTimePeriods?: string[];
  resources?: Array<{ id?: string | number; name: string; url?: string }>;
  createdAt?: string;
  updatedAt?: string;
  // 後端有回傳擁有者，但先前型別未宣告（對齊 product 的 practice.user）
  user?: { id?: string | null } | null;
};

type ApiCheckIn = {
  id: string | number;
  practiceId: string | number;
  note?: string;
  createdAt: string;
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
    // 詳情頁對齊 product：保留頻率、時長、執行時機、起訖日、進度等原始欄位
    frequencyMinDays: practice.frequencyMinDays,
    frequencyMaxDays: practice.frequencyMaxDays,
    sessionDurationMinutes: practice.sessionDurationMinutes,
    practiceTimePeriods: practice.practiceTimePeriods,
    startDate: practice.startDate ?? null,
    endDate: practice.endDate ?? null,
    progressPercentage: practice.progressPercentage,
    durationDays: practice.durationDays,
    user: practice.user ?? null,
    resources: (practice.resources ?? []).map((resource, index) => ({
      id: String(resource.id ?? resource.url ?? index),
      name: resource.name,
      url: resource.url,
    })),
  };
};

const mapCheckIn = (checkIn: ApiCheckIn): ICheckIn => ({
  id: String(checkIn.id),
  practiceId: String(checkIn.practiceId),
  note: checkIn.note,
  createdAt: checkIn.createdAt,
});

export function usePractices() {
  const {
    data: practicesData,
    error: practicesError,
    isLoading: practicesLoading,
    mutate,
  } = useMyPractices({ limit: 16 });

  const { data: statsData, isLoading: statsLoading } = useMyPracticeStats();

  const practices = practicesData?.data ?? [];

  const { inProgressTasks, completedTasks, allTasks } = useMemo(() => {
    const inProgressTasksData: IInProgressTask[] = [];
    const completedTasksData: ICompletedTask[] = [];
    // 對齊 product：「我的」用單一卡片型別呈現所有狀態的實踐，故所有實踐都轉成同一形狀
    const allTasksData: IInProgressTask[] = [];

    for (const practice of practices) {
      const isInProgress =
        practice.status === PracticeStatus.active ||
        practice.status === PracticeStatus.draft ||
        practice.status === PracticeStatus.notStarted;

      const lastCheckInDate = practice.lastCheckinAt ?? null;

      const unifiedTask: IInProgressTask = {
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
      };
      allTasksData.push(unifiedTask);

      if (isInProgress) {
        inProgressTasksData.push(unifiedTask);
      } else if (practice.status === PracticeStatus.completed) {
        completedTasksData.push({
          id: practice.id,
          label: "主題實踐",
          title: practice.title,
          description: practice.practiceAction || "",
          // viewCount / commentCount 尚未同步進 generated types（server dev branch 合併後才有）
          viewCount: (practice as { viewCount?: number }).viewCount ?? 0,
          commentCount: (practice as { commentCount?: number }).commentCount ?? 0,
          tags: practice.tags || [],
        });
      }
    }

    return {
      inProgressTasks: inProgressTasksData,
      completedTasks: completedTasksData,
      allTasks: allTasksData,
    };
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
    allTasks,
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
  /** 前端 MoodType（會 map 成 API mood） */
  mood?: MoodType;
  /** 打卡標籤（後端必填至少 1 個） */
  tags?: string[];
  /** 本機圖片 URI（expo-image-picker） */
  mediaUris?: string[];
}

interface ICheckInResult {
  success: boolean;
  error?: string;
  /** 打卡後實踐進度 %（API CheckInWithEncouragement） */
  practiceProgressPercentage?: number;
  /** 後端鼓勵句 */
  encouragement?: string;
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
    // 原始回應（含 mood / checkinDate），供心情排行與打卡堆疊使用，對齊 product
    checkInsData: data?.data,
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
    async ({
      practiceId,
      note,
      mood,
      tags = [],
      mediaUris = [],
    }: ICheckInParams): Promise<ICheckInResult> => {
      if (isCheckingRef.current) {
        return { success: false, error: "正在處理中" };
      }

      if (tags.length === 0) {
        return { success: false, error: "請至少選擇一個標籤" };
      }

      isCheckingRef.current = true;
      setIsChecking(true);

      try {
        // FormData + unauthorizedHandler（Bearer）— 對齊 product / 支援圖片
        const response = await createPracticeCheckInWithFormData(practiceId, {
          mood: mapMoodTypeToApiMood(mood ?? null),
          tags,
          description: note ?? "",
          media: mediaUris.map((uri, index) => createReactNativeFormDataFile(uri, index)),
        });

        // 新手任務 D：完成第一次打卡
        applyOnboardingUpdateFromResponse(response);

        // CheckInWithEncouragement：data 內含 encouragement + practiceProgressPercentage
        const payload =
          response && typeof response === "object" && "data" in response
            ? (response as { data?: Record<string, unknown> }).data
            : undefined;
        const practiceProgressPercentage =
          payload && typeof payload.practiceProgressPercentage === "number"
            ? payload.practiceProgressPercentage
            : undefined;
        const encouragement =
          payload && typeof payload.encouragement === "string" ? payload.encouragement : undefined;

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
        return { success: true, practiceProgressPercentage, encouragement };
      } catch (error) {
        return {
          success: false,
          error: extractApiErrorMessage(error, "打卡失敗，請稍後再試"),
        };
      } finally {
        isCheckingRef.current = false;
        setIsChecking(false);
      }
    },
    [mutate]
  );

  return { checkIn, isChecking };
}
