"use client";

import { Clarity } from "./clarity";
import { GoogleAnalytics } from "./google-analytics";
import { PostHog } from "./posthog";

// Component that only renders the analytics scripts
export function AnalyticsScripts({
  disableSessionReplay = false,
}: {
  disableSessionReplay?: boolean;
}) {
  return (
    <>
      <GoogleAnalytics />
      {!disableSessionReplay && <Clarity />}
      <PostHog disableSessionReplay={disableSessionReplay} />
    </>
  );
}

interface AnalyticsProviderProps {
  children?: React.ReactNode;
  disableSessionReplay?: boolean;
}

// Provider component that wraps children with analytics scripts
export function AnalyticsProvider({
  children,
  disableSessionReplay = false,
}: AnalyticsProviderProps) {
  return (
    <>
      <AnalyticsScripts disableSessionReplay={disableSessionReplay} />
      {children}
    </>
  );
}
