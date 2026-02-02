// Google Analytics 4 (gtag.js) helper functions
// gtag.js is already initialized in global-providers.tsx

export const GACategory = {
  User: "User",
  Share: "Share",
} as const;

/**
 * Log a custom event to Google Analytics 4
 * @param category - Event category
 * @param action - Event action
 * @param label - Event label (optional)
 * @param value - Event value (optional)
 */
export const logEvent = (
  category = "",
  action = "",
  label = "",
  value: number | null = null
): void => {
  if (typeof window === "undefined" || !window.gtag) {
    return;
  }

  if (category && action) {
    const eventParams: Record<string, string | number | undefined> = {
      event_category: category,
      event_label: label || undefined,
    };

    if (value !== null) {
      eventParams.value = value;
    }

    // GA4 uses 'event' method with event name and parameters
    window.gtag("event", action, eventParams);
  }
};

/**
 * Log an exception to Google Analytics 4
 * @param description - Exception description
 * @param fatal - Whether the exception is fatal
 */
export const logException = (description = "", fatal = false): void => {
  if (typeof window === "undefined" || !window.gtag) {
    return;
  }

  if (description) {
    window.gtag("event", "exception", {
      description,
      fatal,
    });
  }
};
