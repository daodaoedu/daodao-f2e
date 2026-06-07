"use client";

import type { ReactNode } from "react";

const IS_HARNESS_DEMO = process.env.NEXT_PUBLIC_HARNESS_DEMO === "1";

export function HarnessGate({ children }: { children: ReactNode }) {
  if (!IS_HARNESS_DEMO) return null;
  return <>{children}</>;
}
