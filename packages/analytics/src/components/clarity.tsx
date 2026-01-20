"use client";

import Script from "next/script";
import { getAnalyticsConfig } from "../lib/config";

declare global {
  interface Window {
    clarity: (
      command: "set" | "identify" | "consent" | "event",
      ...args: unknown[]
    ) => void;
  }
}

export function Clarity() {
  const config = getAnalyticsConfig();

  if (!config.clarity.enabled || !config.clarity.projectId) {
    return null;
  }

  const projectId = config.clarity.projectId;

  return (
    <Script id="microsoft-clarity" strategy="afterInteractive">
      {`
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${projectId}");
      `}
    </Script>
  );
}

// Helper functions for Clarity
export const clarityIdentify = (userId: string, sessionId?: string, pageId?: string) => {
  if (typeof window !== "undefined" && window.clarity) {
    window.clarity("identify", userId, sessionId, pageId);
  }
};

export const claritySetTag = (key: string, value: string) => {
  if (typeof window !== "undefined" && window.clarity) {
    window.clarity("set", key, value);
  }
};

export const clarityEvent = (eventName: string) => {
  if (typeof window !== "undefined" && window.clarity) {
    window.clarity("event", eventName);
  }
};

export const clarityConsent = () => {
  if (typeof window !== "undefined" && window.clarity) {
    window.clarity("consent");
  }
};
