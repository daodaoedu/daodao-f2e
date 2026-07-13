import { createContext, type ReactNode, useContext } from "react";
import useSWR, { mutate as globalMutate, type KeyedMutator } from "swr";
import { useAuth } from "@/providers/AuthProvider";
import { authStorage } from "@/services/auth-storage";

// 對齊 product task-guide/onboarding-progress-context
// 新手入門任務狀態：走 /api/v1/onboarding/status（非 openapi types 內，故 raw fetch + Bearer token）

export type OnboardingTaskKey = "A" | "B" | "C" | "D" | "E";

export interface OnboardingTaskItem {
  taskKey: OnboardingTaskKey;
  done: boolean;
  ctaHref?: string;
}

export interface OnboardingStatusData {
  taskList: OnboardingTaskItem[];
  completedTasks: number;
}

interface OnboardingStatusResponse {
  success: boolean;
  data: OnboardingStatusData;
}

interface OnboardingProgressContextValue {
  taskList: OnboardingTaskItem[];
  completedTasks: number;
  isLoading: boolean;
  mutate: KeyedMutator<OnboardingStatusResponse>;
}

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? "https://api.daodao.so").replace(
  /\/$/,
  ""
);

export const ONBOARDING_STATUS_KEY = "/api/v1/onboarding/status";

const fetcher = async (url: string): Promise<OnboardingStatusResponse> => {
  const token = await authStorage.getAccessToken();
  const res = await fetch(`${API_BASE_URL}${url}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Failed to fetch onboarding status");
  return res.json() as Promise<OnboardingStatusResponse>;
};

const OnboardingProgressContext = createContext<OnboardingProgressContextValue | null>(null);

export function OnboardingProgressProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const shouldFetch = isAuthenticated && !isAuthLoading;

  const { data, isLoading, mutate } = useSWR<OnboardingStatusResponse>(
    shouldFetch ? ONBOARDING_STATUS_KEY : null,
    fetcher,
    { revalidateOnFocus: true }
  );

  const statusData = data?.data;

  return (
    <OnboardingProgressContext.Provider
      value={{
        taskList: statusData?.taskList ?? [],
        completedTasks: statusData?.completedTasks ?? 0,
        isLoading,
        mutate,
      }}
    >
      {children}
    </OnboardingProgressContext.Provider>
  );
}

export function useOnboardingProgress(): OnboardingProgressContextValue {
  const ctx = useContext(OnboardingProgressContext);
  if (!ctx) {
    throw new Error("useOnboardingProgress must be used within OnboardingProgressProvider");
  }
  return ctx;
}

export function refreshOnboardingStatus() {
  void globalMutate(ONBOARDING_STATUS_KEY);
}

/**
 * 從 API 回應的 meta.onboardingUpdate 即時標記任務完成（對齊 product）。
 * 在「完成任務的動作」成功後呼叫，傳入回應 body（含 meta）。
 */
export function applyOnboardingUpdateFromResponse(response: unknown): boolean {
  if (!response || typeof response !== "object") return false;

  const meta = (response as { meta?: unknown }).meta;
  if (!meta || typeof meta !== "object") return false;

  const update = (meta as { onboardingUpdate?: unknown }).onboardingUpdate;
  if (!update || typeof update !== "object") return false;

  const { taskKey, allCompleted } = update as {
    taskKey?: OnboardingTaskKey;
    allCompleted?: boolean;
  };
  if (!taskKey) return false;

  void globalMutate(
    ONBOARDING_STATUS_KEY,
    (prev?: OnboardingStatusResponse) => {
      if (!prev?.data) return prev;
      const updatedTaskList = prev.data.taskList.map((item) =>
        item.taskKey === taskKey ? { ...item, done: true } : item
      );
      return {
        ...prev,
        data: {
          ...prev.data,
          taskList: updatedTaskList,
          completedTasks: updatedTaskList.filter((task) => task.done).length,
        },
      };
    },
    { revalidate: false }
  );

  if (allCompleted) {
    setTimeout(() => refreshOnboardingStatus(), 3000);
  }
  return true;
}
