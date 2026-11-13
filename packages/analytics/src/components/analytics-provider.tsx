"use client";

import { Clarity } from "./clarity";
import { GoogleAnalytics } from "./google-analytics";
import { PostHog } from "./posthog";

// Component that only renders the analytics scripts
export function AnalyticsScripts({
  disableSessionReplay = false,
  websitePrivacy = false,
}: {
  disableSessionReplay?: boolean;
  websitePrivacy?: boolean;
}) {
  return (
    <>
      <GoogleAnalytics websitePrivacy={websitePrivacy} />
      {!disableSessionReplay && <Clarity />}
      <PostHog disableSessionReplay={disableSessionReplay} websitePrivacy={websitePrivacy} />
    </>
  );
}

interface AnalyticsProviderProps {
  children?: React.ReactNode;
  disableSessionReplay?: boolean;
  websitePrivacy?: boolean;
}

// Provider component that wraps children with analytics scripts
export function AnalyticsProvider({
  children,
  disableSessionReplay = false,
  websitePrivacy = false,
}: AnalyticsProviderProps) {
  return (
    <>
      <AnalyticsScripts
        disableSessionReplay={disableSessionReplay}
        websitePrivacy={websitePrivacy}
      />
      {children}
    </>
  );
}
