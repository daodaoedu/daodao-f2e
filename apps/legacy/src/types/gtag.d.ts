// Google Analytics gtag.js type definitions

interface Window {
  gtag?: (
    command: "config" | "set" | "event" | "js",
    targetId: string | Date | Record<string, unknown>,
    config?: Record<string, unknown>
  ) => void;
  dataLayer?: unknown[];
}
