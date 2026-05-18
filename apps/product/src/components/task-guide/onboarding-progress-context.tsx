"use client";

import { createContext, useContext, type ReactNode } from "react";
import useSWR, { type KeyedMutator } from "swr";
import { useAuth } from "@daodao/auth";

// ── Types ─────────────────────────────────────────────────────────────────────

export type OnboardingTaskKey = "A" | "B" | "C" | "D" | "E";

export interface OnboardingTaskItem {
  taskKey: OnboardingTaskKey;
  done: boolean;
}

export interface OnboardingStatusData {
  taskList: OnboardingTaskItem[];
  completedTasks: number;
  badgeGranted: boolean;
}

interface OnboardingStatusResponse {
  success: boolean;
  data: OnboardingStatusData;
}

interface OnboardingProgressContextValue {
  taskList: OnboardingTaskItem[];
  completedTasks: number;
  badgeGranted: boolean;
  isLoading: boolean;
  mutate: KeyedMutator<OnboardingStatusResponse>;
}

// ── Context ───────────────────────────────────────────────────────────────────

const OnboardingProgressContext = createContext<OnboardingProgressContextValue | null>(null);

export const ONBOARDING_STATUS_KEY = "/api/v1/onboarding/status";

const fetcher = async (url: string): Promise<OnboardingStatusResponse> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch onboarding status");
  return res.json() as Promise<OnboardingStatusResponse>;
};

// ── Provider ──────────────────────────────────────────────────────────────────

export function OnboardingProgressProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isTemporary, isLoading: isAuthLoading } = useAuth();

  const shouldFetch = isAuthenticated && !isTemporary && !isAuthLoading;

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
        badgeGranted: statusData?.badgeGranted ?? false,
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
  if (!ctx) throw new Error("useOnboardingProgress must be used within OnboardingProgressProvider");
  return ctx;
}
