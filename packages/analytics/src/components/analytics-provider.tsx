"use client";

import { Clarity } from "./clarity";
import { GoogleAnalytics } from "./google-analytics";
import { PostHog } from "./posthog";

// Component that only renders the analytics scripts
export function AnalyticsScripts() {
  return (
    <>
      <GoogleAnalytics />
      <Clarity />
      <PostHog />
    </>
  );
}

interface AnalyticsProviderProps {
  children?: React.ReactNode;
}

// Provider component that wraps children with analytics scripts
export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  return (
    <>
      <AnalyticsScripts />
      {children}
    </>
  );
}
