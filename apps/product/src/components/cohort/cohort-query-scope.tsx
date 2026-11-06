"use client";

import { defaultSwrConfig, SwrConfigProvider } from "@daodao/api";
import { useAuth } from "@daodao/auth";
import type { ReactNode } from "react";

/** Remount the private cohort cache when identity changes, including logout/login in the same SPA. */
export function CohortQueryScope({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  return (
    <SwrConfigProvider
      key={user?.id ?? "guest"}
      value={{ ...defaultSwrConfig, provider: () => new Map() }}
    >
      {children}
    </SwrConfigProvider>
  );
}
