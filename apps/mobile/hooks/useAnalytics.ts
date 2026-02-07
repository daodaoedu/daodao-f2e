import { useCallback } from "react";
import { useAnalyticsContext } from "@/providers/AnalyticsProvider";
import type {
  AnalyticsUser,
  CheckInEventProperties,
  LoginEventProperties,
  PracticeCreatedEventProperties,
  ShareCheckInEventProperties,
} from "@/services/analytics";

export function useAnalytics() {
  const analytics = useAnalyticsContext();

  const identify = useCallback(
    (user: AnalyticsUser) => {
      analytics.identify(user);
    },
    [analytics]
  );

  const reset = useCallback(() => {
    analytics.reset();
  }, [analytics]);

  const trackScreenView = useCallback(
    (screenName: string) => {
      analytics.trackScreenView(screenName);
    },
    [analytics]
  );

  const trackCheckIn = useCallback(
    (properties: CheckInEventProperties) => {
      analytics.trackCheckIn(properties);
    },
    [analytics]
  );

  const trackPracticeCreated = useCallback(
    (properties: PracticeCreatedEventProperties) => {
      analytics.trackPracticeCreated(properties);
    },
    [analytics]
  );

  const trackLogin = useCallback(
    (properties: LoginEventProperties) => {
      analytics.trackLogin(properties);
    },
    [analytics]
  );

  const trackShareCheckIn = useCallback(
    (properties: ShareCheckInEventProperties) => {
      analytics.trackShareCheckIn(properties);
    },
    [analytics]
  );

  return {
    identify,
    reset,
    trackScreenView,
    trackCheckIn,
    trackPracticeCreated,
    trackLogin,
    trackShareCheckIn,
  };
}
