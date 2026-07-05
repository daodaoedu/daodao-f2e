declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_POSTHOG_KEY?: string;
    EXPO_PUBLIC_POSTHOG_HOST?: string;
    EXPO_PUBLIC_CLARITY_PROJECT_ID?: string;
    EXPO_PUBLIC_ENABLE_ANALYTICS?: string;
    EXPO_PUBLIC_WEBSITE_URL?: string;
  }
}
