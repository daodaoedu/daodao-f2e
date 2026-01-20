import { getEnv } from "@daodao/config/env";

export interface AnalyticsConfig {
  googleAnalytics: {
    enabled: boolean;
    measurementId: string | undefined;
  };
  clarity: {
    enabled: boolean;
    projectId: string | undefined;
  };
  posthog: {
    enabled: boolean;
    apiKey: string | undefined;
    apiHost: string;
  };
}

export const getAnalyticsConfig = (): AnalyticsConfig => {
  const enableAnalytics = getEnv("NEXT_PUBLIC_ENABLE_ANALYTICS") === "true";

  return {
    googleAnalytics: {
      enabled: enableAnalytics && !!getEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID"),
      measurementId: getEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID"),
    },
    clarity: {
      enabled: enableAnalytics && !!getEnv("NEXT_PUBLIC_CLARITY_PROJECT_ID"),
      projectId: getEnv("NEXT_PUBLIC_CLARITY_PROJECT_ID"),
    },
    posthog: {
      enabled: enableAnalytics && !!getEnv("NEXT_PUBLIC_POSTHOG_KEY"),
      apiKey: getEnv("NEXT_PUBLIC_POSTHOG_KEY"),
      apiHost: getEnv("NEXT_PUBLIC_POSTHOG_HOST") || "https://us.i.posthog.com",
    },
  };
};
