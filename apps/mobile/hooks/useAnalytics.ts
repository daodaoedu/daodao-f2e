import { useCallback } from "react";
import { useAnalyticsContext } from "@/providers/AnalyticsProvider";
import type {
  IAnalyticsUser,
  ICheckInEventProperties,
  ILoginEventProperties,
  IPracticeCreatedEventProperties,
  IShareCheckInEventProperties,
} from "@/services/analytics";

export function useAnalytics() {
  const analytics = useAnalyticsContext();

  const identify = useCallback(
    (user: IAnalyticsUser) => {
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
    (properties: ICheckInEventProperties) => {
      analytics.trackCheckIn(properties);
    },
    [analytics]
  );

  const trackPracticeCreated = useCallback(
    (properties: IPracticeCreatedEventProperties) => {
      analytics.trackPracticeCreated(properties);
    },
    [analytics]
  );

  const trackLogin = useCallback(
    (properties: ILoginEventProperties) => {
      analytics.trackLogin(properties);
    },
    [analytics]
  );

  const trackShareCheckIn = useCallback(
    (properties: IShareCheckInEventProperties) => {
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
