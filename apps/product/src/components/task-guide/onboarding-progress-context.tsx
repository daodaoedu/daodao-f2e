"use client";

import { useAuth } from "@daodao/auth";
import { getRequiredEnv } from "@daodao/config";
import { createContext, type ReactNode, useCallback, useContext, useState } from "react";
import useSWR, { mutate as globalMutate, type KeyedMutator } from "swr";

// ── Types ─────────────────────────────────────────────────────────────────────

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
  isTaskGuideExpanded: boolean;
  openTaskGuide: () => void;
  closeTaskGuide: () => void;
  mutate: KeyedMutator<OnboardingStatusResponse>;
}

// ── Context ───────────────────────────────────────────────────────────────────

const OnboardingProgressContext = createContext<OnboardingProgressContextValue | null>(null);

export const ONBOARDING_STATUS_KEY = "/api/v1/onboarding/status";

const fetcher = async (url: string): Promise<OnboardingStatusResponse> => {
  const baseUrl = getRequiredEnv("NEXT_PUBLIC_API_URL").replace(/\/$/, "");
  const res = await fetch(`${baseUrl}${url}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch onboarding status");
  return res.json() as Promise<OnboardingStatusResponse>;
};

// ── Provider ──────────────────────────────────────────────────────────────────

export function OnboardingProgressProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isTemporary, isLoading: isAuthLoading } = useAuth();
  const [isTaskGuideExpanded, setIsTaskGuideExpanded] = useState(false);

  const shouldFetch = isAuthenticated && !isTemporary && !isAuthLoading;
  const openTaskGuide = useCallback(() => setIsTaskGuideExpanded(true), []);
  const closeTaskGuide = useCallback(() => setIsTaskGuideExpanded(false), []);

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
        isTaskGuideExpanded,
        openTaskGuide,
        closeTaskGuide,
        mutate,
      }}
    >
      {children}
    </OnboardingProgressContext.Provider>
  );
}

export function useOnboardingProgress(): OnboardingProgressContextValue {
  const ctx = useContext(OnboardingProgressContext);
  if (!ctx) throw new Error("useOnboardingProgress must be used within OnboardingProgressProvider");
  return ctx;
}

export function refreshOnboardingStatus() {
  void globalMutate(ONBOARDING_STATUS_KEY);
}

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
