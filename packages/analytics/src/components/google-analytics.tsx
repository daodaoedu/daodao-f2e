"use client";

import Script from "next/script";
import { getBlogPageContext, sanitizeWebsitePath } from "../lib/blog-events";
import { getAnalyticsConfig } from "../lib/config";

declare global {
  interface Window {
    gtag: (
      command: "config" | "event" | "js" | "set",
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void;
    dataLayer: unknown[];
  }
}

export function GoogleAnalytics({ websitePrivacy = false }: { websitePrivacy?: boolean }) {
  const config = getAnalyticsConfig();

  if (!config.googleAnalytics.enabled || !config.googleAnalytics.measurementId) {
    return null;
  }

  const measurementId = config.googleAnalytics.measurementId;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          const blogPageContext = ${getBlogPageContext.toString()};
          gtag('config', '${measurementId}', {
            page_path: window.location.pathname,
            ...blogPageContext(window.location.href, document.referrer, ${websitePrivacy}, (${sanitizeWebsitePath.toString()})),
          });
        `}
      </Script>
    </>
  );
}

// Helper functions for tracking events
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  const config = getAnalyticsConfig();
  if (typeof window !== "undefined" && window.gtag && config.googleAnalytics.enabled) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

export const trackPageView = (url: string) => {
  const config = getAnalyticsConfig();
  if (
    typeof window !== "undefined" &&
    window.gtag &&
    config.googleAnalytics.enabled &&
    config.googleAnalytics.measurementId
  ) {
    window.gtag("config", config.googleAnalytics.measurementId, {
      page_path: url,
    });
  }
};
