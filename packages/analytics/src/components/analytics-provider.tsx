"use client";

import { GoogleAnalytics } from "./google-analytics";
import { Clarity } from "./clarity";
import { PostHog } from "./posthog";

interface AnalyticsProviderProps {
  children?: React.ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  return (
    <>
      <GoogleAnalytics />
      <Clarity />
      <PostHog />
      {children}
    </>
  );
}

// Also export a component that only renders the scripts (no children wrapper)
export function AnalyticsScripts() {
  return (
    <>
      <GoogleAnalytics />
      <Clarity />
      <PostHog />
    </>
  );
}
