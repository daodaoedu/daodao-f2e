// Components
export { AnalyticsProvider, AnalyticsScripts } from "./components/analytics-provider";
export {
  Clarity,
  clarityConsent,
  clarityEvent,
  clarityIdentify,
  claritySetTag,
} from "./components/clarity";
export { GoogleAnalytics, trackEvent, trackPageView } from "./components/google-analytics";
export {
  PostHog,
  posthogCapture,
  posthogGetFeatureFlag,
  posthogIdentify,
  posthogIsFeatureEnabled,
  posthogOptIn,
  posthogOptOut,
  posthogReset,
  posthogSetPersonProperties,
} from "./components/posthog";
export {
  activationEventSchema,
  activationInputSchema,
  evaluateLeaderActivation,
} from "./lib/blog-activation";

export {
  type BlogInteractionType,
  blogInteractionSchema,
  classifyBlogSource,
  createBlogTracker,
  sanitizeBlogAnalyticsEvent,
} from "./lib/blog-events";
// Config
export { type AnalyticsConfig, getAnalyticsConfig } from "./lib/config";
