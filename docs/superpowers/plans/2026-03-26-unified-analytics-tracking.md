# Unified Analytics Tracking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a unified, typed analytics tracker that sends events to GA4, PostHog, and Clarity across website, product, and mobile apps.

**Architecture:** A platform-agnostic `core/` sub-path in `packages/analytics` holds event types, adapter interface, and tracker logic. Web adapters and Next.js components stay in the package root. Mobile adapters live in `apps/mobile/adapters/`. Each app registers its own adapters at startup.

**Tech Stack:** TypeScript, Next.js (web), Expo/React Native (mobile), GA4, PostHog, Microsoft Clarity, Firebase Analytics

**Spec:** `docs/superpowers/specs/2026-03-25-unified-analytics-tracking-design.md`

---

## File Structure

### New Files
- `packages/analytics/src/core/events/types.ts` — EventMap and all property interfaces
- `packages/analytics/src/core/events/index.ts` — Re-export all event types
- `packages/analytics/src/core/adapters/types.ts` — AnalyticsAdapter interface
- `packages/analytics/src/core/tracker.ts` — trackUnifiedEvent, registerAdapter, identify, reset, consent, optIn, optOut
- `packages/analytics/src/core/index.ts` — Re-export core public API
- `packages/analytics/src/adapters/ga4.ts` — GA4 web adapter with sanitization
- `packages/analytics/src/adapters/posthog.ts` — PostHog web adapter
- `packages/analytics/src/adapters/clarity.ts` — Clarity web adapter
- `packages/analytics/src/adapters/index.ts` — Re-export web adapters
- `apps/mobile/adapters/firebase.ts` — Firebase mobile adapter
- `apps/mobile/adapters/posthog.ts` — PostHog mobile adapter
- `apps/mobile/adapters/clarity.ts` — Clarity mobile adapter
- `apps/mobile/adapters/index.ts` — Re-export mobile adapters

### Modified Files
- `packages/analytics/package.json` — Add `./core` export path
- `packages/analytics/src/index.ts` — Re-export core + web adapters
- `apps/website/src/app/global-provider.tsx` — Add initTracker + registerAdapter
- `apps/product/src/app/global-provider.tsx` — Add initTracker + registerAdapter
- `apps/product/src/app/[locale]/practices/[id]/page.tsx` — Replace posthogCapture with trackUnifiedEvent
- `apps/product/src/components/resource/resource-detail-client.tsx` — Replace posthogCapture with trackUnifiedEvent
- `apps/website/src/components/layout/header.tsx` — Add cta_clicked tracking
- `apps/website/src/components/landing-page/key-vision/key-vision.tsx` — Add cta_clicked tracking
- `apps/website/src/components/landing-page/community-section.tsx` — Add cta_clicked tracking
- `apps/website/src/components/landing-page/join-section.tsx` — Add cta_clicked tracking
- `apps/website/src/components/landing-page/call-to-action-section.tsx` — Add cta_clicked tracking
- `apps/website/src/components/landing-page/plan-section.tsx` — Add cta_clicked tracking
- `apps/website/src/components/layout/footer.tsx` — Add newsletter_subscribed tracking
- `apps/mobile/services/analytics.ts` — Rewrite to use core tracker
- `apps/mobile/providers/AnalyticsProvider.tsx` — Simplify to use core tracker

---

## Phase 1: Package Refactor

### Task 1: Core Event Types

**Files:**
- Create: `packages/analytics/src/core/events/types.ts`
- Create: `packages/analytics/src/core/events/index.ts`

- [ ] **Step 1: Create event types file**

```typescript
// packages/analytics/src/core/events/types.ts

// --- Auth Events ---

export interface SignupProperties {
  method: "google" | "apple" | "email";
  referrer_page: string;
}

export interface LoginProperties {
  method: "google" | "apple" | "email";
}

// onboarding_completed has no properties

// --- Practice Events ---

// practice_create_started has no properties

export interface PracticeCreatedProperties {
  practice_id: string;
  template_id?: string;
  duration_days: number;
  frequency: "2-4" | "3-5" | "4-7";
  is_first: boolean;
}

export interface PracticeArchivedProperties {
  practice_id: string;
}

export interface CheckInProperties {
  practice_id: string;
  streak_count: number;
  has_note: boolean;
  has_media: boolean;
  mood?: string;
  is_first: boolean;
}

// --- Content Events ---

export interface ContentViewedProperties {
  content_type: "practice" | "resource";
  content_id: string;
}

export interface TemplateSelectedProperties {
  template_id: string;
}

// --- Engagement Events ---

export interface CtaClickedProperties {
  cta_id: string;
  page: string;
  section: string;
}

// newsletter_subscribed has no properties

export interface CommentCreatedProperties {
  content_type: "practice" | "check_in";
  content_id: string;
}

export interface ShareProperties {
  content_type: "practice" | "check_in" | "quiz_result" | "action_maker_result";
  content_id: string;
  share_method?: string;
}

// --- Website Funnel Events ---

// quiz_started has no properties

export interface QuizCompletedProperties {
  result_theme: string;
}

// action_maker_started has no properties
// action_maker_completed has no properties

// --- Generic Events ---

export interface FunnelDroppedProperties {
  funnel_name: "quiz" | "action_maker" | "practice_create";
  last_step: string;
}

// --- Event Map ---

export interface EventMap {
  // Auth
  signup: SignupProperties;
  login: LoginProperties;
  onboarding_completed: Record<string, never>;

  // Practice
  practice_create_started: Record<string, never>;
  practice_created: PracticeCreatedProperties;
  practice_archived: PracticeArchivedProperties;
  check_in: CheckInProperties;

  // Content
  content_viewed: ContentViewedProperties;
  template_selected: TemplateSelectedProperties;

  // Engagement
  cta_clicked: CtaClickedProperties;
  newsletter_subscribed: Record<string, never>;
  comment_created: CommentCreatedProperties;
  share: ShareProperties;

  // Website Funnel
  quiz_started: Record<string, never>;
  quiz_completed: QuizCompletedProperties;
  action_maker_started: Record<string, never>;
  action_maker_completed: Record<string, never>;

  // Generic
  funnel_dropped: FunnelDroppedProperties;
}

export type AnalyticsEventName = keyof EventMap;
```

- [ ] **Step 2: Create events index**

```typescript
// packages/analytics/src/core/events/index.ts
export type {
  EventMap,
  AnalyticsEventName,
  SignupProperties,
  LoginProperties,
  PracticeCreatedProperties,
  PracticeArchivedProperties,
  CheckInProperties,
  ContentViewedProperties,
  TemplateSelectedProperties,
  CtaClickedProperties,
  CommentCreatedProperties,
  ShareProperties,
  QuizCompletedProperties,
  FunnelDroppedProperties,
} from "./types";
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd /Users/xiaoxu/Projects/daodao/daodao-f2e && npx tsc --noEmit -p packages/analytics/tsconfig.json`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add packages/analytics/src/core/events/
git commit -m "feat(analytics): add unified event type definitions for 18 tracked events"
```

---

### Task 2: Adapter Interface & Tracker Core

**Files:**
- Create: `packages/analytics/src/core/adapters/types.ts`
- Create: `packages/analytics/src/core/tracker.ts`
- Create: `packages/analytics/src/core/index.ts`

- [ ] **Step 1: Create adapter interface**

```typescript
// packages/analytics/src/core/adapters/types.ts
export interface AnalyticsAdapter {
  name: string;
  track(event: string, properties: Record<string, unknown>): void;
  identify?(userId: string, traits?: Record<string, unknown>): void;
  reset?(): void;
  consent?(): void;
  optIn?(): void;
  optOut?(): void;
}
```

- [ ] **Step 2: Create tracker**

```typescript
// packages/analytics/src/core/tracker.ts
import type { EventMap } from "./events";
import type { AnalyticsAdapter } from "./adapters/types";

export interface TrackerConfig {
  platform: "web" | "mobile";
  app: "website" | "product" | "mobile";
}

let config: TrackerConfig | null = null;
const adapters: AnalyticsAdapter[] = [];

export function initTracker(trackerConfig: TrackerConfig): void {
  config = trackerConfig;
  adapters.length = 0; // Clear adapters on re-init (HMR safety)
}

export function registerAdapter(adapter: AnalyticsAdapter): void {
  if (adapters.some((a) => a.name === adapter.name)) return; // Dedup guard
  adapters.push(adapter);
}

export function trackUnifiedEvent<T extends keyof EventMap>(
  event: T,
  ...args: EventMap[T] extends Record<string, never> ? [] : [properties: EventMap[T]]
): void {
  const properties = (args[0] ?? {}) as Record<string, unknown>;
  const enriched: Record<string, unknown> = {
    ...properties,
    ...(config && { platform: config.platform, app: config.app }),
  };

  for (const adapter of adapters) {
    try {
      adapter.track(event, enriched);
    } catch (e) {
      if (process.env.NODE_ENV === "development") {
        console.warn(`[analytics] ${adapter.name} track failed:`, e);
      }
    }
  }
}

export function identify(
  userId: string,
  traits?: Record<string, unknown>
): void {
  for (const adapter of adapters) {
    try {
      adapter.identify?.(userId, traits);
    } catch (e) {
      if (process.env.NODE_ENV === "development") {
        console.warn(`[analytics] ${adapter.name} identify failed:`, e);
      }
    }
  }
}

export function reset(): void {
  for (const adapter of adapters) {
    try {
      adapter.reset?.();
    } catch {}
  }
}

export function consent(): void {
  for (const adapter of adapters) {
    try {
      adapter.consent?.();
    } catch {}
  }
}

export function optOut(): void {
  for (const adapter of adapters) {
    try {
      adapter.optOut?.();
    } catch {}
  }
}

export function optIn(): void {
  for (const adapter of adapters) {
    try {
      adapter.optIn?.();
    } catch {}
  }
}
```

Note: The `trackUnifiedEvent` signature uses a conditional rest parameter so that events with `Record<string, never>` (no properties) can be called without a second argument: `trackUnifiedEvent("quiz_started")` instead of `trackUnifiedEvent("quiz_started", {})`.

- [ ] **Step 3: Create core index**

```typescript
// packages/analytics/src/core/index.ts
export type { AnalyticsAdapter } from "./adapters/types";
export type { TrackerConfig } from "./tracker";
export {
  initTracker,
  registerAdapter,
  trackUnifiedEvent,
  identify,
  reset,
  consent,
  optIn,
  optOut,
} from "./tracker";
export type {
  EventMap,
  AnalyticsEventName,
  SignupProperties,
  LoginProperties,
  PracticeCreatedProperties,
  PracticeArchivedProperties,
  CheckInProperties,
  ContentViewedProperties,
  TemplateSelectedProperties,
  CtaClickedProperties,
  CommentCreatedProperties,
  ShareProperties,
  QuizCompletedProperties,
  FunnelDroppedProperties,
} from "./events";
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `cd /Users/xiaoxu/Projects/daodao/daodao-f2e && npx tsc --noEmit -p packages/analytics/tsconfig.json`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add packages/analytics/src/core/
git commit -m "feat(analytics): add adapter interface and unified tracker core"
```

---

### Task 3: Web Adapters (GA4, PostHog, Clarity)

**Files:**
- Create: `packages/analytics/src/adapters/ga4.ts`
- Create: `packages/analytics/src/adapters/posthog.ts`
- Create: `packages/analytics/src/adapters/clarity.ts`
- Create: `packages/analytics/src/adapters/index.ts`

- [ ] **Step 1: Create GA4 adapter with sanitization**

```typescript
// packages/analytics/src/adapters/ga4.ts
import type { AnalyticsAdapter } from "../core/adapters/types";

const MAX_PARAMS = 25;
const MAX_KEY_LENGTH = 40;
const MAX_VALUE_LENGTH = 100;

function sanitize(properties: Record<string, unknown>): Record<string, string | number> {
  const sanitized: Record<string, string | number> = {};
  const entries = Object.entries(properties).slice(0, MAX_PARAMS);

  for (const [key, value] of entries) {
    if (value === undefined || value === null) continue;
    const safeKey = key.slice(0, MAX_KEY_LENGTH);

    if (typeof value === "string") {
      sanitized[safeKey] = value.slice(0, MAX_VALUE_LENGTH);
    } else if (typeof value === "boolean") {
      sanitized[safeKey] = value ? 1 : 0;
    } else if (typeof value === "number") {
      sanitized[safeKey] = value;
    } else {
      sanitized[safeKey] = String(value).slice(0, MAX_VALUE_LENGTH);
    }
  }
  return sanitized;
}

export const ga4Adapter: AnalyticsAdapter = {
  name: "ga4",

  track(event, properties) {
    if (typeof window === "undefined" || typeof window.gtag !== "function") return;
    window.gtag("event", event, sanitize(properties));
  },

  identify(userId) {
    if (typeof window === "undefined" || typeof window.gtag !== "function") return;
    window.gtag("set", { user_id: userId });
  },

  reset() {
    if (typeof window === "undefined" || typeof window.gtag !== "function") return;
    window.gtag("set", { user_id: null });
  },
};
```

- [ ] **Step 2: Create PostHog adapter**

```typescript
// packages/analytics/src/adapters/posthog.ts
import type { AnalyticsAdapter } from "../core/adapters/types";

function getPostHog() {
  if (typeof window === "undefined") return null;
  return (window as Record<string, unknown>).posthog as
    | {
        capture: (event: string, properties?: Record<string, unknown>) => void;
        identify: (distinctId: string, properties?: Record<string, unknown>) => void;
        reset: () => void;
        opt_out_capturing: () => void;
        opt_in_capturing: () => void;
      }
    | undefined;
}

export const posthogAdapter: AnalyticsAdapter = {
  name: "posthog",

  track(event, properties) {
    getPostHog()?.capture(event, properties);
  },

  identify(userId, traits) {
    getPostHog()?.identify(userId, traits);
  },

  reset() {
    getPostHog()?.reset();
  },

  optOut() {
    getPostHog()?.opt_out_capturing();
  },

  optIn() {
    getPostHog()?.opt_in_capturing();
  },
};
```

- [ ] **Step 3: Create Clarity adapter**

```typescript
// packages/analytics/src/adapters/clarity.ts
import type { AnalyticsAdapter } from "../core/adapters/types";

type ClarityFn = (method: string, ...args: unknown[]) => void;

function getClarity(): ClarityFn | null {
  if (typeof window === "undefined") return null;
  return (window as Record<string, unknown>).clarity as ClarityFn | undefined ?? null;
}

export const clarityAdapter: AnalyticsAdapter = {
  name: "clarity",

  track(event) {
    // Clarity only supports event name, no properties
    getClarity()?.("event", event);
  },

  identify(userId) {
    getClarity()?.("identify", userId);
  },

  consent() {
    getClarity()?.("consent");
  },
};
```

- [ ] **Step 4: Create adapters index**

```typescript
// packages/analytics/src/adapters/index.ts
export { ga4Adapter } from "./ga4";
export { posthogAdapter } from "./posthog";
export { clarityAdapter } from "./clarity";
```

- [ ] **Step 5: Verify TypeScript compiles**

Run: `cd /Users/xiaoxu/Projects/daodao/daodao-f2e && npx tsc --noEmit -p packages/analytics/tsconfig.json`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add packages/analytics/src/adapters/
git commit -m "feat(analytics): add GA4, PostHog, and Clarity web adapters"
```

---

### Task 4: Package Exports & Main Index Update

**Files:**
- Modify: `packages/analytics/package.json`
- Modify: `packages/analytics/src/index.ts`

- [ ] **Step 1: Add core export path to package.json**

In `packages/analytics/package.json`, add a `"./core"` export entry to the `"exports"` field:

```json
{
  "exports": {
    ".": "./src/index.ts",
    "./core": "./src/core/index.ts",
    "./components/*": "./src/components/*.tsx",
    "./lib/*": "./src/lib/*.ts"
  }
}
```

This allows mobile to `import { trackUnifiedEvent } from "@daodao/analytics/core"` without pulling in Next.js dependencies.

- [ ] **Step 2: Update main index.ts to re-export new APIs**

Add to the bottom of `packages/analytics/src/index.ts`:

```typescript
// Unified tracker (new API)
export {
  initTracker,
  registerAdapter,
  trackUnifiedEvent,
  identify,
  reset,
  consent,
  optIn,
  optOut,
} from "./core";
export type {
  AnalyticsAdapter,
  TrackerConfig,
  EventMap,
  AnalyticsEventName,
} from "./core";

// Web adapters
export { ga4Adapter, posthogAdapter, clarityAdapter } from "./adapters";
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd /Users/xiaoxu/Projects/daodao/daodao-f2e && npx tsc --noEmit -p packages/analytics/tsconfig.json`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add packages/analytics/package.json packages/analytics/src/index.ts
git commit -m "feat(analytics): expose core sub-path export for mobile and re-export new APIs"
```

---

## Phase 2: Web Integration

### Task 5: Initialize Tracker in Website App

**Files:**
- Modify: `apps/website/src/app/global-provider.tsx:3,28` (import and usage)

- [ ] **Step 1: Read current global-provider.tsx**

Read `apps/website/src/app/global-provider.tsx` to see current structure.

- [ ] **Step 2: Add tracker initialization**

Add imports and initialization call. The initialization must run once at module load time (before any component renders):

```typescript
import {
  initTracker,
  registerAdapter,
  ga4Adapter,
  posthogAdapter,
  clarityAdapter,
} from "@daodao/analytics";

initTracker({ platform: "web", app: "website" });
registerAdapter(ga4Adapter);
registerAdapter(posthogAdapter);
registerAdapter(clarityAdapter);
```

Place these lines at the top level of the file (after imports, before the component). The existing `<AnalyticsScripts />` must remain — it loads the third-party scripts that the adapters depend on.

- [ ] **Step 3: Verify website dev server starts**

Run: `cd /Users/xiaoxu/Projects/daodao/daodao-f2e && npx turbo dev --filter=website -- --port 3001`
Expected: No build errors, page loads normally

- [ ] **Step 4: Commit**

```bash
git add apps/website/src/app/global-provider.tsx
git commit -m "feat(website): initialize unified analytics tracker"
```

---

### Task 6: Initialize Tracker in Product App

**Files:**
- Modify: `apps/product/src/app/global-provider.tsx:3,41`

- [ ] **Step 1: Read current global-provider.tsx**

Read `apps/product/src/app/global-provider.tsx` to see current structure.

- [ ] **Step 2: Add tracker initialization**

Same pattern as Task 5, but with `app: "product"`:

```typescript
import {
  initTracker,
  registerAdapter,
  ga4Adapter,
  posthogAdapter,
  clarityAdapter,
} from "@daodao/analytics";

initTracker({ platform: "web", app: "product" });
registerAdapter(ga4Adapter);
registerAdapter(posthogAdapter);
registerAdapter(clarityAdapter);
```

- [ ] **Step 3: Verify product dev server starts**

Run: `cd /Users/xiaoxu/Projects/daodao/daodao-f2e && npx turbo dev --filter=product -- --port 3000`
Expected: No build errors, page loads normally

- [ ] **Step 4: Commit**

```bash
git add apps/product/src/app/global-provider.tsx
git commit -m "feat(product): initialize unified analytics tracker"
```

---

### Task 7: Migrate Existing content_viewed Events

**Files:**
- Modify: `apps/product/src/app/[locale]/practices/[id]/page.tsx:216-221`
- Modify: `apps/product/src/components/resource/resource-detail-client.tsx:37-42`

- [ ] **Step 1: Read both files**

Read the practice detail page and resource detail client to see current posthogCapture usage.

- [ ] **Step 2: Replace posthogCapture in practice detail page**

In `apps/product/src/app/[locale]/practices/[id]/page.tsx`, replace:

```typescript
import { posthogCapture } from "@daodao/analytics";
```
with:
```typescript
import { trackUnifiedEvent } from "@daodao/analytics";
```

And replace the `posthogCapture("content_viewed", {...})` call with:

```typescript
trackUnifiedEvent("content_viewed", {
  content_type: "practice",
  content_id: practiceId,
});
```

Note: The old code sent `entity_type`, `entity_id`, `referrer`, `platform` — the new event type uses `content_type` and `content_id` (per spec), and `platform` is auto-injected by the tracker.

- [ ] **Step 3: Replace posthogCapture in resource detail**

In `apps/product/src/components/resource/resource-detail-client.tsx`, same replacement:

```typescript
import { trackUnifiedEvent } from "@daodao/analytics";

// In the useEffect:
trackUnifiedEvent("content_viewed", {
  content_type: "resource",
  content_id: resource.id,
});
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `cd /Users/xiaoxu/Projects/daodao/daodao-f2e && npx tsc --noEmit -p apps/product/tsconfig.json`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add apps/product/src/app/[locale]/practices/[id]/page.tsx apps/product/src/components/resource/resource-detail-client.tsx
git commit -m "refactor(product): migrate content_viewed to unified tracker"
```

---

### Task 8: Add CTA Click Tracking to Website Landing Page

**Files:**
- Modify: `apps/website/src/components/layout/header.tsx:103`
- Modify: `apps/website/src/components/landing-page/key-vision/key-vision.tsx:61`
- Modify: `apps/website/src/components/landing-page/community-section.tsx:49`
- Modify: `apps/website/src/components/landing-page/join-section.tsx:116`
- Modify: `apps/website/src/components/landing-page/call-to-action-section.tsx:28`
- Modify: `apps/website/src/components/landing-page/plan-section.tsx:62`
- Modify: Personality section component (find via landing page — links to `/quiz`)
- Modify: Learning Marathon apply button component (find via `apps/website/src/components/learning-marathons/`)

- [ ] **Step 1: Read all CTA component files**

Read each file to understand the current onClick handlers. Also find the personality section component and marathon apply button.

- [ ] **Step 2: Add tracking to header CTA**

In `apps/website/src/components/layout/header.tsx`, add import and tracking before the existing `openLoginDialog` call:

```typescript
import { trackUnifiedEvent } from "@daodao/analytics";

// In the button onClick:
onClick={() => {
  trackUnifiedEvent("cta_clicked", { cta_id: "header_join", page: "landing", section: "header" });
  openLoginDialog({ redirectUrl: "/" });
}}
```

- [ ] **Step 3: Add tracking to key-vision CTA**

In `key-vision.tsx`:

```typescript
onClick={() => {
  trackUnifiedEvent("cta_clicked", { cta_id: "hero_join", page: "landing", section: "key_vision" });
  openLoginDialog({ redirectUrl: "/" });
}}
```

- [ ] **Step 4: Add tracking to community section CTA**

In `community-section.tsx`:

```typescript
onClick={() => {
  trackUnifiedEvent("cta_clicked", { cta_id: "community_join", page: "landing", section: "community" });
  openLoginDialog({ redirectUrl: "/" });
}}
```

- [ ] **Step 5: Add tracking to join section CTA**

In `join-section.tsx`:

```typescript
onClick={() => {
  trackUnifiedEvent("cta_clicked", { cta_id: "join_section", page: "landing", section: "join" });
  openLoginDialog({ redirectUrl: "/" });
}}
```

- [ ] **Step 6: Add tracking to call-to-action section CTA**

In `call-to-action-section.tsx`:

```typescript
onClick={() => {
  trackUnifiedEvent("cta_clicked", { cta_id: "bottom_cta", page: "landing", section: "call_to_action" });
  openLoginDialog({ redirectUrl: "/" });
}}
```

- [ ] **Step 7: Add tracking to plan section CTA**

In `plan-section.tsx`:

```typescript
onClick={() => {
  trackUnifiedEvent("cta_clicked", { cta_id: "plan_join", page: "landing", section: "plan" });
  openLoginDialog({ redirectUrl: "/" });
}}
```

- [ ] **Step 8: Add tracking to personality test CTA**

In the personality section component (links to `/quiz`):

```typescript
onClick={() => {
  trackUnifiedEvent("cta_clicked", { cta_id: "personality_test", page: "landing", section: "personality" });
  // existing navigation to /quiz
}}
```

- [ ] **Step 9: Add tracking to marathon apply CTA**

In the marathon apply button component:

```typescript
onClick={() => {
  trackUnifiedEvent("cta_clicked", { cta_id: "marathon_apply", page: "learning_marathon", section: "apply" });
  // existing modal/link behavior
}}
```

- [ ] **Step 10: Verify TypeScript compiles**

Run: `cd /Users/xiaoxu/Projects/daodao/daodao-f2e && npx tsc --noEmit -p apps/website/tsconfig.json`
Expected: No errors

- [ ] **Step 11: Commit**

```bash
git add apps/website/src/components/
git commit -m "feat(website): add CTA click tracking to landing page and marathon page"
```

---

### Task 9: Add Newsletter Subscription Tracking

**Files:**
- Modify: `apps/website/src/components/layout/footer.tsx` (newsletter form submit handler)

- [ ] **Step 1: Read footer.tsx**

Read `apps/website/src/components/layout/footer.tsx` to find the newsletter form submission handler.

- [ ] **Step 2: Add tracking on successful subscription**

Import `trackUnifiedEvent` and fire after the form submission succeeds (after the API call to Kit.com returns success):

```typescript
import { trackUnifiedEvent } from "@daodao/analytics";

// Inside the success handler:
trackUnifiedEvent("newsletter_subscribed");
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd /Users/xiaoxu/Projects/daodao/daodao-f2e && npx tsc --noEmit -p apps/website/tsconfig.json`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add apps/website/src/components/layout/footer.tsx
git commit -m "feat(website): add newsletter subscription tracking"
```

---

### Task 10: Add Quiz Funnel Tracking

**Files:**
- Modify: Quiz intro page component (the component rendered by `apps/website/src/app/[locale]/(without-layout)/quiz/page.tsx`)
- Modify: Quiz result page component (the component rendered by `apps/website/src/app/[locale]/(without-layout)/quiz/result/[resultId]/page.tsx`)

Note: These pages likely import components from `@daodao/features-quiz`. Read the page files first to determine the actual component file paths.

- [ ] **Step 1: Read quiz page files to find component paths**

Read `apps/website/src/app/[locale]/(without-layout)/quiz/page.tsx` and `apps/website/src/app/[locale]/(without-layout)/quiz/result/[resultId]/page.tsx`.

- [ ] **Step 2: Add quiz_started tracking**

In the quiz intro component, fire `trackUnifiedEvent("quiz_started")` when the user clicks the start button. Read the component to find the exact handler.

```typescript
import { trackUnifiedEvent } from "@daodao/analytics";

// On start button click:
trackUnifiedEvent("quiz_started");
```

- [ ] **Step 3: Add quiz_completed tracking**

In the quiz result detail component, fire on mount (the user seeing the result means they completed the quiz):

```typescript
import { trackUnifiedEvent } from "@daodao/analytics";

// In useEffect on mount:
trackUnifiedEvent("quiz_completed", { result_theme: theme });
```

Where `theme` is the result theme ID from the route params.

- [ ] **Step 4: Verify TypeScript compiles**

Run: `cd /Users/xiaoxu/Projects/daodao/daodao-f2e && npx tsc --noEmit -p apps/website/tsconfig.json`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add <quiz component files>
git commit -m "feat(website): add quiz funnel tracking (started + completed)"
```

---

### Task 11: Add Action Maker Funnel Tracking

**Files:**
- Modify: Action Maker intro component (from `@daodao/features-action-maker`)
- Modify: Action Maker result component (from `@daodao/features-action-maker`)

- [ ] **Step 1: Find Action Maker component paths**

Read `apps/website/src/app/[locale]/(without-layout)/action-maker/page.tsx` and `apps/website/src/app/[locale]/(without-layout)/action-maker/result/page.tsx` to find the imported components.

- [ ] **Step 2: Add action_maker_started tracking**

In the Action Maker intro component, fire when the user clicks the start/begin button:

```typescript
import { trackUnifiedEvent } from "@daodao/analytics";

trackUnifiedEvent("action_maker_started");
```

- [ ] **Step 3: Add action_maker_completed tracking**

In the Action Maker result component, fire on mount:

```typescript
trackUnifiedEvent("action_maker_completed");
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `cd /Users/xiaoxu/Projects/daodao/daodao-f2e && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add <action maker component files>
git commit -m "feat(website): add Action Maker funnel tracking (started + completed)"
```

---

### Task 12: Add Product App Event Tracking (Practice + Engagement)

**Files:**
- Modify: Practice create flow entry point (find via `apps/product/src/app/[locale]/practices/create/`)
- Modify: Practice create success handler
- Modify: Practice archive handler
- Modify: Check-in submit handler
- Modify: Comment submit handler
- Modify: Template selection handler

- [ ] **Step 1: Find all handler locations**

Read the following files to locate exact handler positions:
- `apps/product/src/app/[locale]/practices/create/page.tsx` (or the component it renders)
- `apps/product/src/app/[locale]/practices/create/manual/` (multi-step form)
- `apps/product/src/app/[locale]/practices/create/success/page.tsx`
- Check-in form component (search for `onSubmit` in check-in components)
- Comment form component (search for comment submission)
- Template selection (search for template click handler in create flow)

- [ ] **Step 2: Add practice_create_started**

Fire when user lands on `/practices/create`:

```typescript
import { trackUnifiedEvent } from "@daodao/analytics";

// On page mount:
trackUnifiedEvent("practice_create_started");
```

- [ ] **Step 3: Add template_selected**

Fire when user selects a template:

```typescript
trackUnifiedEvent("template_selected", { template_id: templateId });
```

- [ ] **Step 4: Add practice_created**

Fire on successful practice creation (in the success handler / API response callback):

```typescript
trackUnifiedEvent("practice_created", {
  practice_id: response.id,
  template_id: formData.templateId,
  duration_days: formData.durationDays,
  frequency: formData.frequency, // Already a Frequency enum string
  is_first: false, // TODO: determine from user's practice count
});
```

Note: `is_first` requires knowing if this is the user's first practice. Check if the API response or user context provides a practice count. If not available, default to `false` and add a follow-up task.

- [ ] **Step 5: Add practice_archived**

Find the archive handler (likely in `apps/product/src/app/[locale]/practices/[id]/page.tsx` or a dialog component):

```typescript
trackUnifiedEvent("practice_archived", { practice_id: practiceId });
```

- [ ] **Step 6: Add check_in**

Find the check-in submit success handler:

```typescript
trackUnifiedEvent("check_in", {
  practice_id: practiceId,
  streak_count: practice.currentStreak ?? 0,
  has_note: !!formData.description,
  has_media: (formData.media?.length ?? 0) > 0,
  mood: formData.mood ?? undefined,
  is_first: false, // TODO: determine from check-in count
});
```

- [ ] **Step 7: Add comment_created**

Find the comment submit handler:

```typescript
trackUnifiedEvent("comment_created", {
  content_type: "practice", // or "check_in" depending on context
  content_id: parentId,
});
```

- [ ] **Step 8: Add share tracking**

Find the share handler in the product app (search for share functionality in practice and check-in components):

```typescript
trackUnifiedEvent("share", {
  content_type: "practice", // or "check_in" depending on context
  content_id: contentId,
  share_method: shareMethod, // e.g., "link", "clipboard", etc. if available
});
```

- [ ] **Step 9: Verify TypeScript compiles**

Run: `cd /Users/xiaoxu/Projects/daodao/daodao-f2e && npx tsc --noEmit -p apps/product/tsconfig.json`
Expected: No errors

- [ ] **Step 10: Commit**

```bash
git add apps/product/
git commit -m "feat(product): add practice, check-in, share, and engagement event tracking"
```

---

### Task 13: Add Identity Tracking (Login/Signup)

**Files:**
- Modify: `packages/auth/src/lib/auth-provider.tsx` (login success + logout handlers)

- [ ] **Step 1: Read auth-provider.tsx**

Read `packages/auth/src/lib/auth-provider.tsx` to find where login success and logout are handled.

- [ ] **Step 2: Add identify on login success**

After authentication succeeds and user data is available:

```typescript
import { identify, trackUnifiedEvent } from "@daodao/analytics";

// On successful auth:
identify(user.id, { email: user.email, name: user.name });
trackUnifiedEvent("login", { method: loginMethod });
```

- [ ] **Step 3: Add reset on logout**

In the logout handler:

```typescript
import { reset } from "@daodao/analytics";

// On logout:
reset();
```

- [ ] **Step 4: Add signup tracking**

If there is a distinct signup flow (first-time user detected), add:

```typescript
trackUnifiedEvent("signup", {
  method: loginMethod,
  referrer_page: window.location.pathname,
});
```

Note: Determine whether signup vs login is distinguishable from the auth callback response. If the API response indicates `isNewUser`, use that. Otherwise, this may need a different approach.

- [ ] **Step 5: Add onboarding_completed tracking**

Find the onboarding flow completion point (likely in `apps/product/src/app/[locale]/auth/onboarding/` or the auth provider). Fire when the user finishes the onboarding steps:

```typescript
trackUnifiedEvent("onboarding_completed");
```

Note: Read the onboarding flow to find the exact completion handler. If onboarding is handled differently on mobile, ensure both platforms fire this event.

- [ ] **Step 6: Verify TypeScript compiles**

Run: `cd /Users/xiaoxu/Projects/daodao/daodao-f2e && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 7: Commit**

```bash
git add packages/auth/src/lib/auth-provider.tsx apps/product/src/app/[locale]/auth/
git commit -m "feat(auth): add identify, login, signup, and onboarding_completed analytics tracking"
```

---

### Task 14: Add Funnel Drop Tracking

**Files:**
- Modify: Quiz layout or intro component
- Modify: Action Maker layout component
- Modify: Practice create flow entry component

This event fires when a user starts a multi-step flow but leaves without completing it.

- [ ] **Step 1: Read the quiz, action maker, and practice create layouts**

Find the layout/wrapper components for each flow to understand where to hook into unmount/navigation events.

- [ ] **Step 2: Implement funnel drop detection pattern**

Create a shared hook or pattern for detecting funnel abandonment. The approach: track current step in state, fire `funnel_dropped` on component unmount if the flow was not completed.

```typescript
// Example pattern using useEffect cleanup:
import { useRef, useEffect } from "react";
import { trackUnifiedEvent } from "@daodao/analytics";

function useFunnelDropTracking(funnelName: "quiz" | "action_maker" | "practice_create") {
  const completed = useRef(false);
  const lastStep = useRef("");

  const markStep = (step: string) => { lastStep.current = step; };
  const markComplete = () => { completed.current = true; };

  useEffect(() => {
    return () => {
      if (!completed.current && lastStep.current) {
        trackUnifiedEvent("funnel_dropped", {
          funnel_name: funnelName,
          last_step: lastStep.current,
        });
      }
    };
  }, [funnelName]);

  return { markStep, markComplete };
}
```

- [ ] **Step 3: Add to quiz flow**

In the quiz layout/wrapper, use the hook. Call `markStep` on each question page, and `markComplete` when reaching the result page.

- [ ] **Step 4: Add to action maker flow**

In the action maker layout, use the hook. Call `markStep` on each step page (category, topic, detail, nickname, actions), and `markComplete` on the result page.

- [ ] **Step 5: Add to practice create flow**

In the practice create flow, call `markStep` on each create step, and `markComplete` on success.

- [ ] **Step 6: Verify TypeScript compiles**

Run: `cd /Users/xiaoxu/Projects/daodao/daodao-f2e && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 7: Commit**

```bash
git add packages/ apps/website/ apps/product/
git commit -m "feat: add funnel drop tracking for quiz, action maker, and practice create flows"
```

---

## Phase 3: Mobile Integration

### Task 15: Create Mobile Adapters

**Files:**
- Create: `apps/mobile/adapters/firebase.ts`
- Create: `apps/mobile/adapters/posthog.ts`
- Create: `apps/mobile/adapters/clarity.ts`
- Create: `apps/mobile/adapters/index.ts`

- [ ] **Step 1: Read current mobile analytics service**

Read `apps/mobile/services/analytics.ts` to understand the existing initialization and sanitization logic.

- [ ] **Step 2: Create Firebase adapter**

Extract the Firebase-specific logic from the existing service. Reuse `sanitizePropertiesForFirebase` logic:

```typescript
// apps/mobile/adapters/firebase.ts
import type { AnalyticsAdapter } from "@daodao/analytics/core";
import Constants from "expo-constants";

const MAX_PARAMS = 25;
const MAX_KEY_LENGTH = 40;
const MAX_VALUE_LENGTH = 100;

let firebaseAnalytics: ReturnType<typeof import("@react-native-firebase/analytics").default> | null = null;

function sanitize(properties: Record<string, unknown>): Record<string, string | number> {
  const sanitized: Record<string, string | number> = {};
  const entries = Object.entries(properties).slice(0, MAX_PARAMS);
  for (const [key, value] of entries) {
    if (value === undefined || value === null) continue;
    const safeKey = key.slice(0, MAX_KEY_LENGTH);
    if (typeof value === "string") {
      sanitized[safeKey] = value.slice(0, MAX_VALUE_LENGTH);
    } else if (typeof value === "boolean") {
      sanitized[safeKey] = value ? 1 : 0;
    } else if (typeof value === "number") {
      sanitized[safeKey] = value;
    }
  }
  return sanitized;
}

export async function createFirebaseAdapter(): Promise<AnalyticsAdapter | null> {
  const isExpoGo = Constants.appOwnership === "expo";
  if (isExpoGo) return null;

  try {
    const mod = await import("@react-native-firebase/analytics");
    firebaseAnalytics = mod.default();
    await firebaseAnalytics.setAnalyticsCollectionEnabled(true);
  } catch {
    return null;
  }

  return {
    name: "firebase",
    track(event, properties) {
      firebaseAnalytics?.logEvent(event, sanitize(properties));
    },
    identify(userId) {
      firebaseAnalytics?.setUserId(userId);
    },
    reset() {
      firebaseAnalytics?.setUserId(null);
    },
  };
}
```

- [ ] **Step 3: Create mobile PostHog adapter**

```typescript
// apps/mobile/adapters/posthog.ts
import type { AnalyticsAdapter } from "@daodao/analytics/core";
import PostHog from "posthog-react-native";

let client: PostHog | null = null;

export function createPostHogAdapter(): AnalyticsAdapter | null {
  const key = process.env.EXPO_PUBLIC_POSTHOG_KEY;
  const host = process.env.EXPO_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
  if (!key) return null;

  client = new PostHog(key, { host, enableSessionReplay: false });

  return {
    name: "posthog",
    track(event, properties) {
      client?.capture(event, properties);
    },
    identify(userId, traits) {
      client?.identify(userId, traits);
    },
    reset() {
      client?.reset();
    },
    optOut() {
      client?.optOut();
    },
    optIn() {
      client?.optIn();
    },
  };
}

export function getPostHogClient(): PostHog | null {
  return client;
}
```

- [ ] **Step 4: Create mobile Clarity adapter**

```typescript
// apps/mobile/adapters/clarity.ts
import type { AnalyticsAdapter } from "@daodao/analytics/core";
import Constants from "expo-constants";

let Clarity: typeof import("@microsoft/react-native-clarity") | null = null;

export async function createClarityAdapter(): Promise<AnalyticsAdapter | null> {
  const projectId = process.env.EXPO_PUBLIC_CLARITY_PROJECT_ID;
  const isExpoGo = Constants.appOwnership === "expo";
  if (!projectId || isExpoGo) return null;

  try {
    Clarity = await import("@microsoft/react-native-clarity");
    Clarity.initialize(projectId);
  } catch {
    return null;
  }

  return {
    name: "clarity",
    track(event) {
      // Clarity native SDK doesn't support custom events the same way
      // Use setCustomTag for event tracking
    },
    identify(userId) {
      Clarity?.setCustomUserId(userId);
    },
  };
}
```

- [ ] **Step 5: Create adapters index**

```typescript
// apps/mobile/adapters/index.ts
export { createFirebaseAdapter } from "./firebase";
export { createPostHogAdapter, getPostHogClient } from "./posthog";
export { createClarityAdapter } from "./clarity";
```

- [ ] **Step 6: Verify TypeScript compiles**

Run: `cd /Users/xiaoxu/Projects/daodao/daodao-f2e && npx tsc --noEmit -p apps/mobile/tsconfig.json`
Expected: No errors

- [ ] **Step 7: Commit**

```bash
git add apps/mobile/adapters/
git commit -m "feat(mobile): add Firebase, PostHog, and Clarity adapters using unified interface"
```

---

### Task 16: Rewrite Mobile Analytics Provider

**Files:**
- Modify: `apps/mobile/providers/AnalyticsProvider.tsx`
- Modify: `apps/mobile/services/analytics.ts` (delete or gut)

- [ ] **Step 1: Read current AnalyticsProvider**

Read `apps/mobile/providers/AnalyticsProvider.tsx` and understand the current context value shape.

- [ ] **Step 2: Rewrite AnalyticsProvider to use unified tracker**

Replace the provider to initialize the tracker and adapters:

```typescript
// apps/mobile/providers/AnalyticsProvider.tsx
import { useEffect, useRef } from "react";
import { usePathname } from "expo-router";
import { PostHogProvider } from "posthog-react-native";
import { initTracker, registerAdapter } from "@daodao/analytics/core";
import {
  createFirebaseAdapter,
  createPostHogAdapter,
  createClarityAdapter,
  getPostHogClient,
} from "../adapters";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);
  const pathname = usePathname();

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    async function init() {
      initTracker({ platform: "mobile", app: "mobile" });

      const posthog = createPostHogAdapter();
      if (posthog) registerAdapter(posthog);

      const firebase = await createFirebaseAdapter();
      if (firebase) registerAdapter(firebase);

      const clarity = await createClarityAdapter();
      if (clarity) registerAdapter(clarity);
    }

    init();
  }, []);

  const client = getPostHogClient();
  if (client) {
    return <PostHogProvider client={client}>{children}</PostHogProvider>;
  }
  return <>{children}</>;
}
```

- [ ] **Step 3: Update all mobile analytics call sites**

Find all existing analytics calls in `apps/mobile/` and replace them with `trackUnifiedEvent`. Key locations from exploration:
- `apps/mobile/providers/AuthProvider.tsx:127,133,156` → `identify()`, `trackUnifiedEvent("login")`, `reset()`
- `apps/mobile/components/CheckInSheet.tsx:127` → `trackUnifiedEvent("check_in")`
- `apps/mobile/hooks/useShare.ts:62` → `trackUnifiedEvent("share", { content_type: "check_in", ... })`

- [ ] **Step 4: Delete old analytics service**

Delete `apps/mobile/services/analytics.ts` and `apps/mobile/hooks/useAnalytics.ts` if they are no longer used.

- [ ] **Step 5: Verify TypeScript compiles**

Run: `cd /Users/xiaoxu/Projects/daodao/daodao-f2e && npx tsc --noEmit -p apps/mobile/tsconfig.json`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add apps/mobile/
git commit -m "refactor(mobile): migrate to unified analytics tracker, remove old analytics service"
```

---

## Phase 4: Verify & Dashboard

### Task 17: Verification & Cleanup

- [ ] **Step 1: Full type check across all apps**

Run: `cd /Users/xiaoxu/Projects/daodao/daodao-f2e && npx turbo typecheck`
Expected: No errors in any app

- [ ] **Step 2: Verify no remaining old API usage**

Search for deprecated function usage:

```bash
grep -r "posthogCapture\|trackEvent\|clarityEvent\|clarityIdentify" --include="*.ts" --include="*.tsx" apps/ packages/ | grep -v "node_modules" | grep -v "analytics/src/components" | grep -v "analytics/src/index.ts"
```

Expected: No results outside of the analytics package's own deprecated re-exports.

- [ ] **Step 3: Run lint**

Run: `cd /Users/xiaoxu/Projects/daodao/daodao-f2e && npx turbo lint`
Expected: No new lint errors

- [ ] **Step 4: Commit any cleanup**

```bash
git add -A
git commit -m "chore: cleanup deprecated analytics imports and verify unified tracking"
```

---

### Task 18: Document PostHog Funnel & GA4 Conversion Setup

This task is a documentation-only task for the product/analytics team.

- [ ] **Step 1: Create setup guide**

Create a brief setup guide in the spec directory:

**PostHog Funnels to create:**
1. Activation: `cta_clicked` → `signup` → `onboarding_completed` → `practice_created` (filter `is_first=true`) → `check_in` (filter `is_first=true`)
2. Quiz: `cta_clicked` (filter `cta_id=personality_test`) → `quiz_started` → `quiz_completed`
3. Action Maker: `action_maker_started` → `action_maker_completed`
4. Practice Create: `practice_create_started` → `template_selected` → `practice_created`

**GA4 Conversions to mark:**
- `signup`
- `practice_created`
- `check_in`

- [ ] **Step 2: Commit**

```bash
git add docs/
git commit -m "docs: add PostHog funnel and GA4 conversion setup guide"
```
