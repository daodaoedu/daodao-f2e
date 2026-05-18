# Mobile Auth Bridge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 讓 `@daodao/api` 的所有 hooks 在 `apps/mobile` 上能以 Bearer token 驗證，取代 mobile 自建的 `api-client.ts`。

**Architecture:** 在 `packages/api/src/client.ts` 加入 module-level 的 `_mobileTokenProvider`，讓 `wrapFetch` 依此切換 Bearer token 或 cookie 模式；新增 `initMobileClient()` 透過 openapi-fetch middleware 覆蓋 baseUrl；`AuthProvider` 在 mount 時注入、unmount 時清除。

> **重要技術細節**：openapi-fetch 0.15.0 的自訂 `fetch` 函式是以單一 `Request` object 呼叫（`fetch(request)`），`init` 永遠是 `undefined`。因此注入 header 時必須從 `input`（即 `Request` object）讀取現有 headers，不能依賴 `init?.headers`。

**Tech Stack:** openapi-fetch 0.15.0 (middleware API: `client.use()` / `client.eject()`), expo-secure-store, React useEffect

---

## Progress Update - 2026-05-17

**Current status:** Phase 1 implementation is complete in branch `fix/mobile-align-desktop`.

**Task status source of truth:** use the checklists in **Dependency and Parallelization Map**, **Roadmap After Phase 1**, and **2026-05-17 Progress Update**. Older step-by-step task blocks below are retained as implementation notes and may include historical unchecked steps.

**Completed:**
- [x] Created isolated worktree for `daodao-f2e`.
- [x] Initialized `projects/daodao-f2e` submodule and created branch `fix/mobile-align-desktop`.
- [x] Moved `next` from `@daodao/api` dependencies to optional peer dependency.
- [x] Added mobile token provider and mobile baseUrl override to `packages/api/src/client.ts`.
- [x] Kept web/product auth on cookie credentials while mobile uses `Authorization: Bearer ...`.
- [x] Added 401 refresh retry path that re-reads the latest mobile token before retrying.
- [x] Exported `initMobileClient`, `clearMobileClient`, `setMobileTokenProvider`, and `clearMobileTokenProvider`.
- [x] Added `refreshTokens()` to `apps/mobile/services/auth-storage.ts`.
- [x] Initialized the shared API client from `apps/mobile/providers/AuthProvider.tsx`.
- [x] Added regression tests for web cookie auth, mobile bearer auth, refresh retry, and mobile baseUrl override.
- [x] Fixed the mobile typed-route typecheck blocker in `ShowcaseCard`.
- [x] Fixed stale shared storage tests for `HomeFeedAnchor` and limited shared Vitest to `src` tests.

**Automated verification:**
- [x] `pnpm --filter @daodao/api test`
- [x] `pnpm --filter @daodao/api typecheck`
- [x] `pnpm --filter @daodao/mobile typecheck`
- [x] `pnpm run lint` (passes with existing warnings)
- [x] `pnpm run typecheck`
- [x] `pnpm test`
- [x] `pnpm --filter @daodao/mobile exec expo export --platform ios --output-dir /private/tmp/daodao-mobile-ios-export`

**Still pending before declaring Phase 1 fully accepted:**
- [x] iOS dev-client runtime smoke: EAS build installs, Metro connects, app reaches login screen.
- [ ] Login runtime verification: call an authenticated `@daodao/api` hook, confirm no 401.
- [ ] Confirm network requests include `Authorization: Bearer ...` on mobile.
- [x] Commit using the repository commit flow after user confirmation.

## Dependency and Parallelization Map

**Sequential gates:**
- [x] Phase 1 iOS dev-client smoke must pass before large-scale hooks migration.
- [x] Phase 2 hooks migration must finish for each domain before P0 screens in that domain are fully wired to data.
- [x] Removing `apps/mobile/services/api-client.ts` must wait until all mobile callers have migrated to `@daodao/api`.
- [ ] Login/authenticated API runtime verification remains required before declaring the auth bridge fully accepted.

**Can run in parallel now:**
- [ ] Login/authenticated runtime verification on iOS.
- [ ] Android runtime smoke.
- [x] Phase 2 hook caller inventory: list every caller of `useCurrentUser`, `usePractices`, practice detail/check-in hooks, and `api-client.ts`.
- [x] Product vs mobile parity audit for notifications, users, practice summary, check-in detail, social, settings, and resource screens.
- [x] UI route scaffolds for missing P0 pages, as long as data wiring waits for the relevant hooks.
- [x] P1/P2 implementation tracks: social hub, footprints, resource screens, and remaining settings parity.

**Runtime verification blockers - 2026-05-18:**
- iOS runtime login verification is blocked locally: iPhone 16 Pro simulator booted, but `com.daodao.app` is not installed. `expo run:ios --device 2CEE9ED2-B95E-4DA6-AF21-CCE0F0F2C18A` generated the native iOS project and then failed during CocoaPods/code-signing setup (`Unicode Normalization not appropriate for ASCII-8BIT` plus no available signing certificates). The generated `apps/mobile/ios` directory was removed after the failed run.
- Android runtime smoke still needs Android platform tools/device access. `adb` is not installed in the current environment.

**Recommended tracks:**
- **Track A - Verification and API foundation:** manual runtime verification, auth bridge runtime fixes, confirm web cookie auth remains unchanged.
- **Track B - Hooks migration:** inventory first, then migrate one hook group at a time; depends on Track A passing.
- **Track C - Parity audit and UI scaffolds:** can proceed during Track A/B; avoid committing data-flow assumptions before hooks stabilize.
- **Track D - P0 page implementation:** can be split by page after the page's required hooks are stable.

**Hook migration dependency order:**
- [x] `useCurrentUser` -> `@daodao/api` user hook.
- [x] `usePractices` -> `useMyPractices()` plus mobile derived-state wrapper.
- [x] Practice detail hooks -> `usePracticeById()`.
- [x] Check-in list/create hooks -> `usePracticeCheckIns()` and `useCreateCheckIn()`.
- [x] Delete retired mobile `api-client.ts` only after caller count is zero.

## Phase 2 Caller Inventory - 2026-05-17

**Batch 1 - Current user and settings profile data**

| Current mobile API | Callers | Target replacement | Notes |
|---|---|---|---|
| `apps/mobile/hooks/useCurrentUser.ts` | `(tabs)/profile.tsx`, `settings/account.tsx`, `settings/public-info.tsx`, `settings/interaction.tsx`, `settings/following.tsx` | `@daodao/api` `useCurrentUser()` | Keep mobile wrapper return shape `{ user, isLoading, error, mutate }` first to minimize UI churn. |
| `api.put("/users/me")` | `settings/account.tsx`, `settings/public-info.tsx`, `settings/interaction.tsx` | `@daodao/api` `useUserMutations().updateCurrentUser()` | Can migrate after read hook is stable. |
| `api.get("/users/preferences/available")`, `api.put("/users/me/preferences")` | `settings/preferences.tsx` | `useAvailablePreferences()`, `useUserMutations().updateCurrentUserPreferences()` or `updateCurrentUserPreferences()` | Independent of practice migration. |

**Batch 2 - Practices dashboard and detail**

| Current mobile API | Callers | Target replacement | Notes |
|---|---|---|---|
| `apps/mobile/hooks/usePractices()` | `(tabs)/index.tsx`, `(tabs)/showcase.tsx`, `(tabs)/profile.tsx`, internal `useCheckIn()` | `useMyPractices()` + `useMyPracticeStats()` + mobile derived-state wrapper | Preserve `inProgressTasks`, `completedTasks`, `stats` shape for existing cards. |
| `usePractice(id)` | `practices/[id]/index.tsx`, `practices/[id]/calendar.tsx` | `usePracticeById(id)` wrapper | Keep `{ practice, isLoading, error, mutate }` shape during transition. |
| `useCheckIns(id)` | `practices/[id]/index.tsx`, `practices/[id]/calendar.tsx`, `PublicPracticeView.tsx` | `usePracticeCheckIns(id)` wrapper | Preserve `checkIns` and `checkInDates`. |
| `useCheckIn()` | `practices/[id]/index.tsx` | `useCreateCheckIn()` if available; otherwise add missing mutation wrapper in `@daodao/api` | Verify actual API path: mobile currently calls `/practices/{id}/check-in`, API package uses `/api/v1/practices/{id}/checkins`. |
| `api.post("/practices")` | `practices/create/manual/step5.tsx` | `@daodao/api` create practice mutation | Can run after dashboard wrapper is stable. |
| `api.post("/practices/{id}/unarchive")` | `settings/archived.tsx` | `useUnarchivePractice()` | Independent small migration. |

**Batch 3 - Social interactions**

| Current mobile API | Callers | Target replacement | Notes |
|---|---|---|---|
| `apps/mobile/hooks/useFollow.ts` | `PublicPracticeView.tsx`, `settings/following.tsx` direct follow APIs | `@daodao/api` `useFollowStatus()`, `useFollowMutations()`, `useFollowing()` | Current API package follow helpers use `unauthorizedHandler.wrapFetch`; verify they work with mobile token provider. |
| `apps/mobile/hooks/useComments.ts` | `CommentSection.tsx`, `PublicPracticeView.tsx` | `@daodao/api` `useComments()` plus mutation functions from `comments.ts` | Comment mutations are service functions, not a combined hook today. |
| `apps/mobile/hooks/useReactions.ts` | `PublicPracticeView.tsx`, `ShowcaseCard` reaction mutations | `@daodao/api` `useReactions()`, `useReactionsList()`, `upsertReaction()`, `removeReaction()` | Preserve mobile derived fields `totalCount`, `displayReactions`, `firstReactorName`. |

**Batch 4 - Notifications and connections**

| Current mobile API | Callers | Target replacement | Notes |
|---|---|---|---|
| `apps/mobile/hooks/useNotifications.ts` | `(tabs)/notifications.tsx` | `@daodao/api` `useNotifications()`, notification service mutations | Existing mobile hook also exposes `unreadCount`; keep wrapper while migrating screen. |
| Direct `api.get/post/delete` connection calls | `settings/connections.tsx`, notifications response action | `useConnections()`, `useIncomingConnectionRequests()`, `useOutgoingConnectionRequests()`, `useConnectionMutations()` | API service currently uses `/connections/request...` in places; compare with mobile `/connections/requests...` before replacing. |
| Direct notification preference calls | `settings/notifications.tsx` | `useNotificationPreferences()`, `updateNotificationPreferences()` | Independent settings migration. |

**Batch 5 - AI backend / showcase feed**

| Current mobile API | Callers | Target replacement | Notes |
|---|---|---|---|
| `useShowcaseFeed()` via `apiClient` absolute AI URL | `(tabs)/index.tsx`, `(tabs)/showcase.tsx` | Shared AI API client for `daodao-ai-backend` | Project has two shared backends: `daodao-server` and `daodao-ai-backend`. This belongs to the AI backend boundary, not the `@daodao/api` client for `daodao-server`. |
| `useShowcaseSuggestions()` via `apiClient` absolute AI URL | `showcase-search-bar.tsx` | Shared AI API client for `daodao-ai-backend` | Align mobile and product/web AI API usage through an AI client/wrapper instead of treating this as mobile-only. |

**Suggested execution order:**
- [x] Batch 1 read-only `useCurrentUser` wrapper migration.
- [x] Batch 2 `usePractices` derived wrapper migration.
- [x] Batch 2 practice detail/check-ins migration.
- [x] Batch 3 social wrappers, preserving current mobile return shapes.
- [x] Batch 4 notifications/settings/connections.
- [x] Batch 2 create/check-in/archive mutations.
- [x] Re-scan `api-client.ts` callers; both `daodao-server` and `daodao-ai-backend` mobile callers have migrated away from `apps/mobile/services/api-client.ts`.

**Batch 2 progress notes - 2026-05-17:**
- [x] `usePractices()` now reads `useMyPractices({ limit: 16 })` and `useMyPracticeStats()`.
- [x] `usePractice(id)` now reads `getPracticeById(id)` and maps the API envelope into the existing mobile `IPractice` shape.
- [x] `useCheckIns(id)` now reads `getPracticeCheckIns(id)` and maps API check-in entities into existing mobile `ICheckIn` strings.
- [x] `useCheckIn()` now posts through `createPracticeCheckIn()` and refreshes both OpenAPI cache keys and mobile wrapper SWR keys.
- [x] `practices/create/manual/step5.tsx` now posts through `createPractice()` with a mobile-form-to-OpenAPI mapping step.
- [x] `settings/archived.tsx` now uses `useMyPractices({ status: "archived", limit: 100 })` and `useUnarchivePractice()`.
- [ ] Practice detail streak fields (`currentStreak`, `longestStreak`) are defaulted because current API detail response does not expose them in the mobile shape.
  - Blocked on API contract: frontend cannot display accurate streak values until the practice detail response includes these fields or exposes an equivalent stats endpoint.

**Batch 3 progress notes - 2026-05-17:**
- [x] `useFollowStatus()`, `followTarget()`, and `unfollowTarget()` now delegate to `@daodao/api` while preserving the mobile wrapper API.
- [x] `useComments()` now reads comments through `@daodao/api` and maps numeric API comment ids back to mobile string ids.
- [x] `createComment()`, `updateComment()`, and `deleteComment()` now use `@daodao/api` service functions; update/delete validate numeric comment ids before calling the API.
- [x] `useReactions()` and `useReactionsList()` now delegate to `@daodao/api` while preserving `totalCount`, `displayReactions`, and `firstReactorName`.
- [x] `upsertReaction()` and `removeReaction()` now follow the generated API contract; `removeReaction()` sends `targetType` and `targetId` in the DELETE body instead of query params.
- [x] Confirm follow runtime env alignment: shared raw-fetch services now resolve through `getApiBaseUrl()`, while mobile initialization uses `EXPO_PUBLIC_API_URL`.
- [x] Confirm comment/reaction mutation cache invalidation behavior in the screens that call these wrappers.

**Batch 4 progress notes - 2026-05-17:**
- [x] `useNotifications()` now reads through `@daodao/api` `getNotifications()` while preserving the mobile return shape and SWR key matcher.
- [x] Notification read/read-all mutations now delegate to `@daodao/api` service functions.
- [x] Notification connection response action now delegates to shared connection service endpoint `/api/v1/connections/request/{requestId}`.
- [x] `settings/notifications.tsx` now uses `useNotificationPreferences()` and `updateNotificationPreferences()` with local mapping for response envelopes.
- [x] `settings/connections.tsx` now uses shared connection hooks/services and maps the API envelope into the existing mobile display shape.
- [x] Notification deep-link route targets are no longer blocked by missing mobile `users/[identifier]` and check-in detail routes.
- [x] Connection/profile row navigation should be rechecked now that mobile `users/[identifier]` exists.

**Final `api-client.ts` caller scan - 2026-05-17:**
- [x] `rg` found no remaining `@/services/api-client` imports or direct `api.get/post/put/delete/patch` calls in `apps/mobile`.
- [x] AI/showcase feed now uses `apps/mobile/services/ai-api-client.ts`, a `daodao-ai-backend` client wrapper around `EXPO_PUBLIC_AI_API_URL`.
- [x] User/settings writes now use `@daodao/api` user hooks/services.
- [x] Follow settings screen now uses shared follow query/mutation wrappers.
- [x] Practice create/archive now use shared practice services/hooks.
- [x] `@daodao/api` `UpdateUserRequest` type source was fixed with `NonNullable<requestBody>` so mobile screens no longer need local mutation casts.
- [x] Retired `apps/mobile/services/api-client.ts`; `ai-api-client.ts` now owns AI backend Bearer auth, 401 refresh retry, timeout, and JSON response parsing.
- [x] Raw-fetch services in `@daodao/api` now resolve base URL through `getApiBaseUrl()`, so mobile uses `initMobileClient({ baseUrl })` instead of requiring `NEXT_PUBLIC_API_URL`.

## Roadmap After Phase 1

**Phase 2 - Hooks Migration**
- [x] Replace `apps/mobile/hooks/useCurrentUser.ts` with `@daodao/api` user hook.
- [x] Replace `apps/mobile/hooks/usePractices.ts` with `useMyPractices()` plus a mobile wrapper for derived groups.
- [x] Replace practice detail/check-in hooks with `usePracticeById()`, `usePracticeCheckIns()`, and `useCreateCheckIn()`.
- [x] Replace social follow/comment/reaction wrappers with `@daodao/api` services/hooks.
- [x] Replace notifications and connection settings calls with `@daodao/api` services/hooks.
- [x] Remove retired calls to `apps/mobile/services/api-client.ts`.
- [x] Delete `apps/mobile/services/api-client.ts` after confirming no remaining mobile imports depend on it.
- [x] Align raw-fetch services (`follow`, `connection`, profile/FormData, image, reactions, footprints) with the mobile base URL override.

**Phase 3 - P0 Screen Parity**
- [x] Add mobile `users/[identifier]`.
- [x] Add mobile `practices/[id]/summary`.
- [x] Add mobile `practices/[id]/check-ins/[checkInId]`.
- [x] Wire notification deep links to user / practice / comment / check-in / buddy request targets.
- [x] Compare mobile notifications with product `/notifications` and fill remaining non-P0 behavior.

**Phase 4 - Social and Navigation**
- [x] Add mobile social tab aligned with product `/social`.
- [x] Add `me/footprints`.
- [x] Migrate `settings/following` and `settings/connections` API calls off mobile `api-client`.
- [x] Review `settings/following` and `settings/connections` UI/navigation parity after `users/[identifier]`.

**Phase 5 - P2 Parity**
- [x] Migrate settings `interaction`, `preferences`, and `public-info` writes to `@daodao/api`.
- [x] Review and align settings `interaction`, `preferences`, and `public-info` UI parity.
- [x] Port resource screens needed on mobile.

## Phase 3-5 Product vs Mobile Parity Audit - 2026-05-17

Local inspection only; no runtime verification performed. Product references are under `apps/product/src`, mobile references are under `apps/mobile`.

| Area | Current mobile status | Product reference path | Gap | Suggested priority / parallelization |
|---|---|---|---|---|
| Notifications | `app/(tabs)/notifications.tsx` now reads through `@daodao/api`, supports read/read-all, connection response actions, local response state, reaction emoji display, created-practice notifications, and deep links to user / practice / comment / check-in / buddy request targets. | `app/[locale]/(with-layout)/notifications/page.tsx`, `components/notifications/notification-list.tsx`, `components/notifications/notification-item.tsx` | Still needs authenticated runtime verification and a product-behavior pass for recency sections and edge-case targets. | P0 route dependency is complete. Remaining work is runtime verification plus non-P0 UI polish. |
| `users/[identifier]` | Mobile route exists with identifier lookup, public profile fields, stats/social links, public practices, follow/unfollow, and connection actions. | `app/[locale]/(with-layout)/users/[identifier]/page.tsx`, `components/user`, `components/practice` | Connection status is inferred from first 100 connections/incoming/outgoing results; needs runtime verification and ideally a backend single-user connection status endpoint. | P0 implemented. Residual is data robustness and UI parity polish. |
| `practices/[id]/summary` | Mobile route exists with `usePracticeSummary`, summary card, native image share, save-to-gallery, and fallback text share. | `app/[locale]/practices/[id]/summary/page.tsx`, `components/practice/summary` | Needs authenticated runtime verification for owner/eligibility states and actual native share/gallery behavior. | P0 implemented. Residual is runtime verification. |
| `practices/[id]/check-ins/[checkInId]` | Mobile route exists and `CheckInList` navigates to detail when `practiceId` is available. | `app/[locale]/practices/[id]/check-ins/[checkInId]/page.tsx`, `components/check-in` | Basic detail is implemented, but product-level same-day navigation, edit/update mutation, and full date selector parity are not done. | P0 deep-link target implemented. Remaining work is richer product parity. |
| Social | Mobile `app/(tabs)/social.tsx` route/tab now exists and consolidates connection requests, connections, following, and followers with profile navigation and follow/connection actions. | `app/[locale]/(with-layout)/social/page.tsx`, `components/social/social-hub.tsx` | Needs authenticated runtime verification and product-level visual polish. | P1 implemented. Remaining work is runtime verification. |
| `me/footprints` | Mobile `app/me/footprints.tsx` route now exists with learning-footprint list, loading/empty states, deleted-practice handling, date formatting, and practice links. | `app/[locale]/(with-layout)/me/footprints/page.tsx`, `components/me/footprints-list.tsx`, `@daodao/api` `useMyFootprints` | Needs authenticated runtime verification. | P1 implemented. Remaining work is runtime verification. |
| `settings/following` | `app/settings/following.tsx` now uses shared follow query/mutation wrappers and navigates user/practice text to the relevant detail routes. | `app/[locale]/(with-layout)/settings/following/page.tsx`, `components/settings/following/following-settings.tsx` | Needs authenticated runtime verification. | P1 implemented. Remaining work is runtime verification. |
| `settings/connections` | `app/settings/connections.tsx` now uses shared connection hooks/services, maps API envelopes to the mobile display shape, and navigates user rows to `users/[identifier]`. | `app/[locale]/(with-layout)/settings/connections/page.tsx`, `components/settings/connections/connections-settings.tsx` | Needs authenticated runtime verification. | P1 implemented. Remaining work is runtime verification. |
| `settings/interaction` | `app/settings/interaction.tsx` now writes through `@daodao/api` user mutation and surfaces update failures. | `app/[locale]/(with-layout)/settings/interaction/page.tsx`, `components/settings/interaction/interaction-settings.tsx` | Needs authenticated runtime verification and optional optimistic rollback polish. | P2 implemented. Remaining work is runtime verification/polish. |
| `settings/preferences` | `app/settings/preferences.tsx` now reads/writes preferences through `@daodao/api`, disables unchanged saves, and guards dirty back navigation. | `app/[locale]/(with-layout)/settings/preferences/page.tsx`, `components/settings/preferences` | Needs authenticated runtime verification and server-field validation parity if backend returns structured errors. | P2 implemented. Remaining work is runtime verification/polish. |
| `settings/public-info` | `app/settings/public-info.tsx` now writes profile fields through `@daodao/api`, supports avatar picking/preview, uploads avatar through FormData, and guards dirty back navigation. | `app/[locale]/(with-layout)/settings/public-info/page.tsx`, `components/settings/public-info` | Needs authenticated runtime verification; country/city selector parity can be a later polish item. | P2 implemented. Remaining work is runtime verification/polish. |
| Resource screens | Mobile `app/resource/index.tsx` and `app/resource/[resourceId].tsx` now provide resource list/search/load-more, detail display, open/share actions, tags, metrics, and contributor info. | `app/[locale]/resource/page.tsx`, `app/[locale]/resource/[resourceId]/page.tsx`, `app/[locale]/resource/categories/page.tsx`, `app/[locale]/resource/categories/[...categories]/page.tsx`, `components/resource` | Category route variants, reviews/reflections, and breadcrumbs remain product-only polish. Needs runtime verification. | P2 implemented. Remaining work is runtime verification and optional category/review parity. |

---

## File Map

| 檔案 | 動作 | 責任 |
|---|---|---|
| `packages/api/package.json` | 修改 | 將 `next` 從 `dependencies` 移至 `peerDependencies`（optional） |
| `packages/api/src/client.ts` | 修改 | 加入 token provider state、修改 `wrapFetch`（正確從 Request object 讀 headers）、加入 `initMobileClient` / `clearMobileClient` |
| `packages/api/src/index.ts` | 修改 | export `initMobileClient`, `clearMobileClient`, `setMobileTokenProvider`, `clearMobileTokenProvider` |
| `apps/mobile/services/auth-storage.ts` | 修改 | 新增 `refreshTokens()` 函式（從 `api-client.ts` 的 `refreshAccessToken` 邏輯提取，含 timeout） |
| `apps/mobile/providers/AuthProvider.tsx` | 修改 | 新增 `useEffect` 呼叫 `initMobileClient` + `unauthorizedHandler.setHandler`，cleanup 呼叫 `clearMobileClient` |

---

## Task 1: 移動 `next` 到 peerDependencies

**Files:**
- Modify: `packages/api/package.json`

- [ ] **Step 1: 修改 `dependencies` 區塊，移除 `next`**

  找到：
  ```json
    "dependencies": {
      "@daodao/config": "workspace:*",
      "next": "catalog:",
      "openapi-fetch": "^0.15.0",
      "swr": "^2.3.8",
      "swr-openapi": "^5.5.0"
    },
  ```

  改為：
  ```json
    "dependencies": {
      "@daodao/config": "workspace:*",
      "openapi-fetch": "^0.15.0",
      "swr": "^2.3.8",
      "swr-openapi": "^5.5.0"
    },
  ```

- [ ] **Step 2: 修改 `peerDependencies` 區塊，加入 `next`**

  找到：
  ```json
    "peerDependencies": {
      "react": "catalog:"
    }
  ```

  改為：
  ```json
    "peerDependencies": {
      "next": ">=15.0.0",
      "react": "catalog:"
    },
    "peerDependenciesMeta": {
      "next": { "optional": true }
    }
  ```

- [ ] **Step 3: 驗證 typecheck 仍通過**

  ```bash
  cd /Users/xiaoxu/Projects/daodao/daodao-f2e
  pnpm --filter @daodao/api typecheck
  ```

  期望：無錯誤

- [ ] **Step 4: Commit**

  ```bash
  git add packages/api/package.json
  ```

  使用 `format-commit` skill 提交，Why: Metro bundler 不應嘗試 bundle `next`（mobile-only 的改動）。

---

## Task 2: 修改 `packages/api/src/client.ts`

**Files:**
- Modify: `packages/api/src/client.ts`

- [ ] **Step 1: 加入 `Middleware` import**

  找到（精確 old_string）：
  ```ts
  import createClient, {
    type ClientPathsWithMethod,
    type FetchResponse,
    type MaybeOptionalInit,
  } from "openapi-fetch";
  ```

  改為：
  ```ts
  import createClient, {
    type ClientPathsWithMethod,
    type FetchResponse,
    type MaybeOptionalInit,
    type Middleware,
  } from "openapi-fetch";
  ```

- [ ] **Step 2: 加入 mobile token provider state 與函式**

  找到：
  ```ts
  export const PREFIX = "dao-dao-server-api" as const;
  ```

  改為（在後面插入新內容）：
  ```ts
  export const PREFIX = "dao-dao-server-api" as const;

  // ============================================================================
  // Mobile Auth Provider
  // ============================================================================

  /**
   * Mobile 平台的 token provider。
   * 設定後，wrapFetch 改用 Bearer token 驗證，不帶 credentials: "include"。
   * Web（product）不設定此值，維持 cookie 行為。
   */
  let _mobileTokenProvider: (() => Promise<string | null>) | null = null;

  /** openapi-fetch middleware 實例，用於覆蓋 mobile 的 baseUrl */
  let _baseUrlMiddleware: Middleware | null = null;

  export function setMobileTokenProvider(fn: () => Promise<string | null>): void {
    _mobileTokenProvider = fn;
  }

  export function clearMobileTokenProvider(): void {
    _mobileTokenProvider = null;
  }
  ```

- [ ] **Step 3: 替換 `wrapFetch` 完整函式體（保持在 UnauthorizedHandler class 內）**

  找到（精確 old_string，包含完整函式體）：
  ```ts
    wrapFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      // 確保 credentials 被設置，以支援跨域 cookie
      const fetchInit: RequestInit = {
        ...init,
        credentials: "include",
      };

      let url: string;
      if (typeof input === "string") {
        url = input;
      } else if (input instanceof URL) {
        url = input.toString();
      } else {
        url = input.url;
      }
      const response = await fetch(input, fetchInit);

      // 如果不是 401 或沒有處理器，直接返回
      if (response.status !== 401 || !this.onUnauthorized) {
        return response;
      }

      // 如果是 refresh token endpoint 返回 401，直接返回，避免死鎖
      const isRefreshEndpoint = url.includes("/api/v1/auth/refresh");
      if (isRefreshEndpoint) {
        return response;
      }

      // 如果正在刷新，等待刷新完成
      if (this.isRefreshing && this.refreshPromise) {
        const refreshSuccess = await this.refreshPromise;
        if (refreshSuccess) {
          // 刷新成功，重試原請求（確保 credentials 被傳遞）
          return fetch(input, fetchInit);
        }
        // 刷新失敗，返回原始 401 響應
        return response;
      }

      // 開始刷新 Token
      this.isRefreshing = true;
      this.refreshPromise = this.onUnauthorized();

      try {
        const refreshSuccess = await this.refreshPromise;
        if (refreshSuccess) {
          // 刷新成功，重試原請求（確保 credentials 被傳遞）
          return fetch(input, fetchInit);
        }
        // 刷新失敗，返回原始 401 響應
        return response;
      } finally {
        // 重置刷新狀態
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    };
  ```

  改為（注意：openapi-fetch 0.15.0 以 `fetch(request)` 呼叫，`init` 永遠是 `undefined`；從 `input` 讀 headers）：
  ```ts
    wrapFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      // openapi-fetch 以單一 Request object 呼叫此函式，init 永遠為 undefined。
      // 必須從 input（Request object）讀取現有 headers，不能依賴 init?.headers。
      const existingHeaders: Record<string, string> =
        input instanceof Request
          ? Object.fromEntries(input.headers.entries())
          : Object.fromEntries(new Headers(init?.headers).entries());

      let fetchInit: RequestInit;

      if (_mobileTokenProvider) {
        // Mobile path：Bearer token，不帶 credentials cookie
        const token = await _mobileTokenProvider();
        fetchInit = {
          ...init,
          headers: {
            ...existingHeaders,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        };
      } else {
        // Web path：維持現有 cookie 行為
        fetchInit = { ...init, headers: existingHeaders, credentials: "include" };
      }

      // URL 解析（Expo/Hermes 已內建 URL global，since RN 0.63）
      let url: string;
      if (typeof input === "string") {
        url = input;
      } else if (input instanceof URL) {
        url = input.toString();
      } else {
        url = input.url;
      }

      const response = await fetch(input, fetchInit);

      // 如果不是 401 或沒有處理器，直接返回
      if (response.status !== 401 || !this.onUnauthorized) {
        return response;
      }

      // 如果是 refresh token endpoint 返回 401，直接返回，避免死鎖
      if (url.includes("/api/v1/auth/refresh")) {
        return response;
      }

      // 如果正在刷新，等待刷新完成後重試
      if (this.isRefreshing && this.refreshPromise) {
        const refreshSuccess = await this.refreshPromise;
        if (refreshSuccess) {
          return this._retryWithFreshToken(input, fetchInit);
        }
        return response;
      }

      // 開始刷新 Token
      this.isRefreshing = true;
      this.refreshPromise = this.onUnauthorized();

      try {
        const refreshSuccess = await this.refreshPromise;
        if (refreshSuccess) {
          return this._retryWithFreshToken(input, fetchInit);
        }
        return response;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    };

    /**
     * 401 refresh 成功後重試原請求，重新取最新 token。
     * fetchInit 保留原始 method/body 等，Authorization 被新 token 覆蓋。
     * fetchInit.headers 是已展開的 plain object，spread order 正確（新 token 覆蓋舊值）。
     */
    private _retryWithFreshToken = async (
      input: RequestInfo | URL,
      fetchInit: RequestInit
    ): Promise<Response> => {
      if (_mobileTokenProvider) {
        const newToken = await _mobileTokenProvider();
        return fetch(input, {
          ...fetchInit,
          headers: {
            ...(fetchInit.headers as Record<string, string>),
            ...(newToken ? { Authorization: `Bearer ${newToken}` } : {}),
          },
        });
      }
      // Web path：cookie 已由 refresh 更新，直接重試
      return fetch(input, fetchInit);
    };
  ```

- [ ] **Step 4: 移除 `createClient` 的頂層 `credentials: "include"`**

  找到：
  ```ts
  export const client = createClient<paths>({
    baseUrl: getRequiredEnv("NEXT_PUBLIC_API_URL"),
    credentials: "include",
    fetch: typeof window === "undefined" ? fetch : unauthorizedHandler.wrapFetch,
  });
  ```

  改為：
  ```ts
  export const client = createClient<paths>({
    baseUrl: getRequiredEnv("NEXT_PUBLIC_API_URL"),
    // credentials 由 wrapFetch 依平台設定（web: "include", mobile: 不設定）
    fetch: typeof window === "undefined" ? fetch : unauthorizedHandler.wrapFetch,
  });
  ```

- [ ] **Step 5: 在 `client` 定義之後加入 `initMobileClient` / `clearMobileClient`**

  找到：
  ```ts
  type InitParam<Init> = Init extends undefined ? never : Init;
  ```

  改為（在前面插入新函式）：
  ```ts
  /**
   * 初始化 mobile 的 API client。
   * - 設定 Bearer token provider（_mobileTokenProvider）
   * - 透過 openapi-fetch middleware 覆蓋 baseUrl（host/protocol/port）
   * 在 AuthProvider mount 時呼叫；在 unmount 時呼叫 clearMobileClient。
   */
  export function initMobileClient(config: {
    baseUrl: string;
    getToken: () => Promise<string | null>;
  }): void {
    setMobileTokenProvider(config.getToken);

    // 移除舊 middleware，防止 Fast Refresh 重複註冊
    if (_baseUrlMiddleware) {
      client.eject(_baseUrlMiddleware);
    }

    _baseUrlMiddleware = {
      onRequest({ request }) {
        const url = new URL(request.url);
        const base = new URL(config.baseUrl);
        url.protocol = base.protocol;
        url.host = base.host;
        url.port = base.port;
        return new Request(url.toString(), request);
      },
    };

    client.use(_baseUrlMiddleware);
  }

  /**
   * 清除 mobile client 設定。在 AuthProvider unmount 時呼叫。
   */
  export function clearMobileClient(): void {
    clearMobileTokenProvider();
    if (_baseUrlMiddleware) {
      client.eject(_baseUrlMiddleware);
      _baseUrlMiddleware = null;
    }
  }

  type InitParam<Init> = Init extends undefined ? never : Init;
  ```

- [ ] **Step 6: Typecheck**

  ```bash
  pnpm --filter @daodao/api typecheck
  ```

  期望：無錯誤

- [ ] **Step 7: Commit**

  ```bash
  git add packages/api/src/client.ts
  ```

  使用 `format-commit` skill 提交。

---

## Task 3: Export 新 API from `packages/api/src/index.ts`

**Files:**
- Modify: `packages/api/src/index.ts`

- [ ] **Step 1: 更新 client export**

  找到：
  ```ts
  export { getSwrKey, getSwrKeyWithResponse, unauthorizedHandler } from "./client";
  ```

  改為：
  ```ts
  export {
    getSwrKey,
    getSwrKeyWithResponse,
    unauthorizedHandler,
    initMobileClient,
    clearMobileClient,
    setMobileTokenProvider,
    clearMobileTokenProvider,
  } from "./client";
  ```

- [ ] **Step 2: Typecheck**

  ```bash
  pnpm --filter @daodao/api typecheck
  ```

  期望：無錯誤

- [ ] **Step 3: Commit**

  ```bash
  git add packages/api/src/index.ts
  ```

  使用 `format-commit` skill 提交。

---

## Task 4: 新增 `refreshTokens()` 到 `auth-storage.ts`

**Files:**
- Modify: `apps/mobile/services/auth-storage.ts`

- [ ] **Step 1: 在 import 之後加入 `API_BASE_URL` 常數**

  找到：
  ```ts
  import * as SecureStore from "expo-secure-store";
  ```

  改為：
  ```ts
  import * as SecureStore from "expo-secure-store";

  const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://api.daodao.so";
  const REQUEST_TIMEOUT = 30_000; // 30 秒，與原 api-client.ts 一致
  ```

- [ ] **Step 2: 在 `authStorage` 物件之後新增 `refreshTokens` 函式**

  找到（包含 `isAuthenticated` 方法以唯一定位 `authStorage` 物件結尾）：
  ```ts
    async isAuthenticated(): Promise<boolean> {
      const token = await this.getAccessToken();
      return !!token;
    },
  };
  ```

  改為（保留 `isAuthenticated`，在 `};` 之後附加 `refreshTokens`）：
  ```ts
    async isAuthenticated(): Promise<boolean> {
      const token = await this.getAccessToken();
      return !!token;
    },
  };

  /**
   * 使用 refresh token 取得新的 access token 並存回 SecureStore。
   * 含 30 秒 timeout（與原 api-client.ts 的 refreshAccessToken 一致）。
   * 若刷新失敗，清除所有 auth 資料（強制登出）。
   */
  export async function refreshTokens(): Promise<void> {
    const refreshToken = await authStorage.getRefreshToken();
    if (!refreshToken) throw new Error("No refresh token available");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        await authStorage.clearAll();
        throw new Error("Token refresh failed");
      }

      const data: { accessToken: string; refreshToken: string } = await response.json();
      await authStorage.setTokens(data);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Token refresh timeout");
      }
      throw error;
    }
  }
  ```
  ```

- [ ] **Step 3: Typecheck**

  ```bash
  pnpm --filter @daodao/mobile typecheck
  ```

  期望：無錯誤

- [ ] **Step 4: Commit**

  ```bash
  git add apps/mobile/services/auth-storage.ts
  ```

  使用 `format-commit` skill 提交。

---

## Task 5: 更新 `AuthProvider.tsx` 注入 API client

**Files:**
- Modify: `apps/mobile/providers/AuthProvider.tsx`

- [ ] **Step 1: 更新 imports**

  找到：
  ```ts
  import { analyticsService } from "@/services/analytics";
  import { type AuthTokens, authStorage, type StoredUser } from "@/services/auth-storage";
  ```

  改為：
  ```ts
  import {
    clearMobileClient,
    initMobileClient,
    unauthorizedHandler,
  } from "@daodao/api";
  import { analyticsService } from "@/services/analytics";
  import { type AuthTokens, authStorage, refreshTokens, type StoredUser } from "@/services/auth-storage";
  ```

- [ ] **Step 2: 在 `AuthProvider` 函式內、`isMountedRef` 定義之後，加入 API client 初始化 `useEffect`**

  找到：
  ```ts
    const isMountedRef = useRef(true);

    // Initialize: Load auth state from SecureStore
    useEffect(() => {
  ```

  改為：
  ```ts
    const isMountedRef = useRef(true);

    // Initialize @daodao/api client for mobile（Bearer token + baseUrl override）
    useEffect(() => {
      initMobileClient({
        baseUrl: process.env.EXPO_PUBLIC_API_URL ?? "https://api.daodao.so",
        getToken: () => authStorage.getAccessToken(),
      });

      unauthorizedHandler.setHandler(async () => {
        try {
          await refreshTokens();
          return true;
        } catch {
          return false;
        }
      });

      return () => {
        // cleanup：避免 React Fast Refresh 重複註冊 middleware 與 handler
        clearMobileClient();
        unauthorizedHandler.clearHandler();
      };
    }, []);

    // Initialize: Load auth state from SecureStore
    useEffect(() => {
  ```

- [ ] **Step 3: Typecheck**

  ```bash
  pnpm --filter @daodao/mobile typecheck
  ```

  期望：無錯誤

- [ ] **Step 4: Commit**

  ```bash
  git add apps/mobile/providers/AuthProvider.tsx
  ```

  使用 `format-commit` skill 提交。

---

## Task 6: Phase 1 驗證 Gate

在繼續 Phase 2（hooks 遷移）之前，必須手動驗證 auth bridge 正常運作。

> **此 task 的程式碼改動須在驗證完後還原，不進入最終 commit。**

**Files:**
- Modify: `apps/mobile/app/(tabs)/index.tsx`（臨時，驗證後還原）

- [ ] **Step 1: 臨時加入 `useCurrentUser` 驗證**

  在 `apps/mobile/app/(tabs)/index.tsx` 頂部加入：

  ```ts
  import { useCurrentUser } from "@daodao/api";
  ```

  在 component 函式內加入（放在 return 之前）：

  ```ts
  const { data: me, error: meError } = useCurrentUser();
  console.log("[Auth Bridge] me:", JSON.stringify(me), "error:", meError?.message);
  ```

- [ ] **Step 2: 啟動 mobile app**

  ```bash
  pnpm --filter @daodao/mobile dev:ios
  ```

- [ ] **Step 3: 確認驗證結果**

  登入後進入 home screen，查看 Metro console（或 Xcode console）。

  **期望：**
  - `[Auth Bridge] me:` 印出當前登入用戶的 JSON（非 undefined）
  - `error:` 為 undefined

  **若 `me` 為 undefined 且 `error` 有值：**
  1. 確認 `EXPO_PUBLIC_API_URL` 有設定（在 `.env` 或 `app.config.ts`）
  2. 在 `wrapFetch` 加 `console.log("[wrapFetch] _mobileTokenProvider:", !!_mobileTokenProvider)` 確認 provider 已注入
  3. 在 `initMobileClient` 加 log 確認函式有被呼叫

- [ ] **Step 4: 還原臨時 code**

  移除 Task 6 Step 1 加入的 import 和 `useCurrentUser` 呼叫。

- [ ] **Step 5: 最終 typecheck**

  ```bash
  pnpm --filter @daodao/api typecheck && pnpm --filter @daodao/mobile typecheck
  ```

  期望：無錯誤

---

## 完成標準

- [x] `pnpm --filter @daodao/api typecheck` 通過
- [x] `pnpm --filter @daodao/mobile typecheck` 通過
- [ ] Mobile app 登入後，`useCurrentUser()` 回傳正確的用戶資料（非 401 錯誤）
- [ ] Network request 帶有 `Authorization: Bearer xxx` header（可用 Proxyman/Charles 確認）
- [x] `apps/product` 行為不受任何影響（web app 仍用 cookie auth）
- [ ] 所有改動已 commit

## 後續計畫

- **Plan 2**：Hooks 遷移（Phase 2）— 以 `@daodao/api` hooks 取代 mobile 自建的 `usePractices.ts`、`useCurrentUser.ts` 等，並刪除 `services/api-client.ts`
- **Plan 3**：P0 新頁面（Phase 3）— notifications、users/[identifier]、practices/[id]/summary、check-ins/[checkInId]

---

## 2026-05-17 Progress Update

### 已完成

- Phase 1 auth bridge 已完成：
  - `@daodao/api` 支援 mobile Bearer token provider。
  - `AuthProvider` 初始化 shared API client。
  - Web/product cookie auth 保持原行為。
- Phase 2 hooks/client 遷移已完成：
  - Mobile 移除 `apps/mobile/services/api-client.ts`。
  - `daodao-server` 呼叫統一走 `@daodao/api`。
  - `daodao-ai-backend` 呼叫保留獨立 `apps/mobile/services/ai-api-client.ts`，因專案本來就有兩個後端。
  - raw fetch services 改用 `getApiBaseUrl()`，避免 Expo runtime 直接依賴 `NEXT_PUBLIC_API_URL`。
- P0 route parity 已補上並接入入口：
  - `apps/mobile/app/users/[identifier].tsx`
  - `apps/mobile/app/practices/[id]/summary.tsx`
  - `apps/mobile/app/practices/[id]/check-ins/[checkInId].tsx`
  - `CheckInList` 支援點擊打卡紀錄進入 check-in detail。
  - practice detail 完成狀態顯示「查看實踐總結」入口。
  - notifications deeplink 支援 user / practice / comment / checkin / buddy_request。
- P1 parity gaps 已補上：
  - user profile 顯示公開實踐列表，點擊可進 practice detail。
  - user profile 支援送出、撤回、同意、忽略、解除連結操作。
  - summary 支援 capture 圖片、native image share、保存到相簿；失敗時 fallback 純文字分享。
  - connection 狀態目前以 `getConnections` / incoming / outgoing 前 100 筆保守推導，後端若補單一 user connection status endpoint 可再替換。

### 驗證狀態

- 已通過：
  - `pnpm --filter @daodao/api test`
  - `pnpm --filter @daodao/api typecheck`
  - `pnpm --filter @daodao/mobile typecheck`
  - `pnpm --filter @daodao/mobile lint`
  - `pnpm run lint`
  - `pnpm run typecheck`
  - `pnpm test`
- 2026-05-17 P1 parity 接入後再次通過：
  - `pnpm --filter @daodao/mobile typecheck`
  - `pnpm --filter @daodao/mobile lint`
  - `pnpm run typecheck`
  - `pnpm run lint`
  - `pnpm test`
- 2026-05-18 P1/P2 parity 接入後通過：
  - `pnpm --filter @daodao/mobile typecheck`
  - `pnpm --filter @daodao/mobile lint`
  - `pnpm --filter @daodao/api typecheck`
  - `pnpm --filter @daodao/product typecheck`
  - `pnpm run lint`
  - `pnpm run typecheck`
  - `pnpm test`
  - `pnpm --filter @daodao/mobile exec expo export --platform ios --output-dir /private/tmp/daodao-mobile-ios-export`
  - `git diff --check`
- 2026-05-18 runtime 啟動嘗試：
  - `adb devices` 無法執行；目前環境沒有 Android platform tools。
  - iPhone 16 Pro simulator (`2CEE9ED2-B95E-4DA6-AF21-CCE0F0F2C18A`) 可 boot，但沒有安裝 `com.daodao.app`。
  - `pnpm --filter @daodao/mobile exec expo run:ios --device 2CEE9ED2-B95E-4DA6-AF21-CCE0F0F2C18A` 未能完成 native run；CocoaPods/Ruby encoding 報 `Unicode Normalization not appropriate for ASCII-8BIT`，並且本機缺少可用 iOS signing certificates。該指令生成的 `apps/mobile/ios` 目錄已移除。
- 2026-05-17 runtime 啟動嘗試：
  - `pnpm --filter @daodao/mobile dev:ios` 未能進入 app；本機 simulator 沒有安裝 development build（`com.daodao.app`）。
  - `pnpm --filter @daodao/mobile dev` 可啟動 Metro，等待 development build 連線。
  - `pnpm --filter @daodao/mobile dev:web` 不能作為替代 smoke test；web bundle 卡在既有依賴缺口 `@lottiefiles/dotlottie-react`（由 `lottie-react-native` web entry 引入）。
- 2026-05-17 EAS / iOS runtime smoke：
  - EAS iOS development build 成功：`36099648-154f-4a57-87e4-9c49bb10a9ac`。
  - Build URL: `https://expo.dev/accounts/vincentxu/projects/daodao/builds/36099648-154f-4a57-87e4-9c49bb10a9ac`
  - Artifact URL: `https://expo.dev/artifacts/eas/7F2dpjdwF3639auki5cxFA.tar.gz`
  - 已安裝到本機 iPhone 16 simulator，透過 dev-client 連 Metro，app 可進入登入畫面。
  - Smoke screenshot: `/tmp/daodao-ios-smoke4.png`
  - 為通過 build/runtime，已補：
    - `app.config.ts` 條件式 Firebase google-services 設定與 `ITSAppUsesNonExemptEncryption: false`。
    - `expo-build-properties` + iOS `GoogleUtilities` modular headers，修正 Firebase pods static library module issue。
    - Expo SDK 54 相容 native deps：`react-native-gesture-handler`、`react-native-reanimated`、`react-native-screens`、`react-native-safe-area-context`、`react-native-worklets`。
    - `@lottiefiles/dotlottie-react`，修正 `lottie-react-native` web entry missing peer。
    - `@daodao/api` base URL fallback，避免 Expo runtime import 時直接依賴 `NEXT_PUBLIC_API_URL`。
    - Metro resolver alias `react` / JSX runtimes / `swr` 到 mobile app node_modules，避免 workspace package duplicate React 造成 invalid hook。

### 仍未完成

- 需做登入後 API runtime 驗證：
  - 登入後 `@daodao/api` requests 帶 Bearer token。
  - 401 refresh 後會以新 token retry。
  - notifications 能正確跳到 user / practice / check-in detail。
  - practice detail 的 check-in card 能跳 detail。
  - completed practice 能進 summary。
- Runtime residual：
  - 本機 dev build 因沒有 google-services config，Firebase Analytics 會出現 non-blocking initialization warning。
  - Tamagui 仍有既有 font-size warning。
  - `expo install --check` 仍回報較廣的 SDK 54 dependency drift；本次只調整 build/runtime blocking 的套件。
- P1 residual：
  - connection 狀態仍依賴列表推導；大量連結/請求超過 100 筆時，目標用戶可能不在本次查詢結果。
