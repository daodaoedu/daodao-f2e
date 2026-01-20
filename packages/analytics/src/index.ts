// Components
export { AnalyticsProvider, AnalyticsScripts } from "./components/analytics-provider";
export { GoogleAnalytics, trackEvent, trackPageView } from "./components/google-analytics";
export {
  Clarity,
  clarityIdentify,
  claritySetTag,
  clarityEvent,
  clarityConsent,
} from "./components/clarity";
export {
  PostHog,
  posthogCapture,
  posthogIdentify,
  posthogReset,
  posthogSetPersonProperties,
  posthogOptOut,
  posthogOptIn,
  posthogIsFeatureEnabled,
  posthogGetFeatureFlag,
} from "./components/posthog";

// Config
export { getAnalyticsConfig, type AnalyticsConfig } from "./lib/config";
