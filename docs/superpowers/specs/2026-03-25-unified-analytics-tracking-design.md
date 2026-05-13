# Unified Analytics Tracking Design

## Overview

建立統一的跨平台 analytics 追蹤系統，涵蓋 website app、product app、mobile app，事件同時送 GA4、PostHog、Clarity 三個平台。

## Goals

1. **轉換漏斗** — Landing Page → 註冊 → 建立練習 → 第一次打卡，每步流失率
2. **功能使用率** — Quiz、Action Maker、打卡、留言、分享的使用頻率
3. **留存黏著度** — 打卡頻率、回訪間隔、streak 分佈
4. **內容效果** — 模板選用率、資源瀏覽熱度

## Architecture

### Package Structure

`packages/analytics` 需要拆分為兩個 export path，因為 mobile (Expo/React Native) 無法依賴 `next`：

```
packages/analytics/
├── core/                        ← 平台無關，無 next 依賴 (sub-path: @daodao/analytics/core)
│   ├── events/
│   │   ├── types.ts             ← EventMap, properties interfaces
│   │   ├── auth.ts
│   │   ├── practice.ts
│   │   ├── content.ts
│   │   ├── engagement.ts
│   │   ├── funnel.ts
│   │   └── index.ts
│   ├── adapters/
│   │   └── types.ts             ← AnalyticsAdapter interface
│   └── tracker.ts               ← trackUnifiedEvent(), registerAdapter(), identify(), consent()
├── adapters/                    ← Web-specific adapters (依賴 window.gtag 等)
│   ├── ga4.ts
│   ├── posthog.ts
│   └── clarity.ts
├── components/                  ← 現有 Next.js Script 元件不動
│   ├── google-analytics.tsx
│   ├── posthog.tsx
│   ├── clarity.tsx
│   └── analytics-provider.tsx
└── index.ts                     ← re-export core + web adapters

apps/mobile/
├── adapters/
│   ├── firebase.ts              ← Firebase adapter (native module，不放 packages)
│   ├── posthog.ts               ← PostHog React Native adapter
│   └── clarity.ts               ← Clarity native adapter
```

Mobile import path: `@daodao/analytics/core`（只拿 events + tracker + adapter interface）
Web import path: `@daodao/analytics`（包含 core + web adapters + components）

### Adapter Interface

```typescript
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

- 每個 adapter 自行處理環境 guard check（web: `typeof window`，mobile: native module 可用性）
- 每個 adapter 的 `track()` 內部為 fire-and-forget（async adapter 自行處理 Promise，不往外拋）
- GA4 adapter 內建 sanitization：25 params 上限、key 40 字元、value 100 字元
- Clarity adapter：
  - `track()`: 只送 event name（`clarity("event", name)`），不送 properties（Clarity 不支援 event-level properties）
  - `identify()`: 呼叫 `clarity("identify", userId)`
  - `consent()`: 呼叫 `clarity("consent")`

### Tracker Core

```typescript
// core/tracker.ts

interface TrackerConfig {
  platform: "web" | "mobile";
  app: "website" | "product" | "mobile";
}

let config: TrackerConfig;
const adapters: AnalyticsAdapter[] = [];

export function initTracker(trackerConfig: TrackerConfig): void {
  config = trackerConfig;
}

export function registerAdapter(adapter: AnalyticsAdapter): void {
  adapters.push(adapter);
}

export function trackUnifiedEvent<T extends keyof EventMap>(
  event: T,
  properties: EventMap[T]
): void {
  const enriched = {
    ...properties,
    platform: config.platform,
    app: config.app,
  };
  for (const adapter of adapters) {
    try {
      adapter.track(event, enriched);
    } catch (e) {
      console.warn(`[analytics] ${adapter.name} failed:`, e);
    }
  }
}

export function identify(userId: string, traits?: Record<string, unknown>): void {
  for (const adapter of adapters) {
    try {
      adapter.identify?.(userId, traits);
    } catch (e) {
      console.warn(`[analytics] ${adapter.name} identify failed:`, e);
    }
  }
}

export function reset(): void {
  for (const adapter of adapters) {
    try { adapter.reset?.(); } catch {}
  }
}

export function consent(): void {
  for (const adapter of adapters) {
    try { adapter.consent?.(); } catch {}
  }
}

export function optOut(): void {
  for (const adapter of adapters) {
    try { adapter.optOut?.(); } catch {}
  }
}

export function optIn(): void {
  for (const adapter of adapters) {
    try { adapter.optIn?.(); } catch {}
  }
}
```

**設計決策：**
- `platform` / `app` 透過 `initTracker()` 注入，不依賴 env var，任何平台都能用
- 每個 adapter 呼叫包 try/catch，一個 adapter 失敗不影響其他
- 不自動注入 `timestamp`（GA4/PostHog 已有 server-side timestamp，多送一個浪費 GA4 參數欄位）

### Initialization

```typescript
// Web: apps/website 的 global-provider.tsx
import { initTracker, registerAdapter } from "@daodao/analytics";
import { ga4Adapter, posthogAdapter, clarityAdapter } from "@daodao/analytics";

initTracker({ platform: "web", app: "website" });
registerAdapter(ga4Adapter);
registerAdapter(posthogAdapter);
registerAdapter(clarityAdapter);

// Web: apps/product 的 global-provider.tsx
initTracker({ platform: "web", app: "product" });
registerAdapter(ga4Adapter);
registerAdapter(posthogAdapter);
registerAdapter(clarityAdapter);

// Mobile: apps/mobile 的 _layout.tsx
import { initTracker, registerAdapter } from "@daodao/analytics/core";
import { firebaseAdapter, posthogAdapter, clarityAdapter } from "./adapters";

initTracker({ platform: "mobile", app: "mobile" });
registerAdapter(firebaseAdapter);
registerAdapter(posthogAdapter);
registerAdapter(clarityAdapter);
```

### User Identity Strategy

匿名使用者從 website 點 CTA 進入 product app 後登入，需要把匿名事件歸到同一個人：

1. **登入成功後** 呼叫 `identify(userId)` — 各 adapter 各自處理：
   - PostHog: `posthog.identify(userId)` — 自動 merge anonymous → identified
   - GA4: `gtag('set', { user_id: userId })`
   - Clarity: `clarity("identify", userId)`
   - Firebase: `analytics().setUserId(userId)`
2. **登出時** 呼叫 `reset()` 清除所有 adapter 的 identity

## Event Catalog (18 events)

### Auth Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `signup` | 首次註冊完成 | `method`: "google" \| "apple" \| "email", `referrer_page`: string |
| `login` | 登入成功 | `method`: "google" \| "apple" \| "email" |
| `onboarding_completed` | 完成 onboarding 流程 | — |

### Practice Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `practice_create_started` | 進入建立練習流程 | — |
| `practice_created` | 成功建立練習 | `practice_id`: string, `template_id?`: string, `duration_days`: number, `frequency`: "2-4" \| "3-5" \| "4-7" (對應 Frequency enum), `is_first`: boolean |
| `practice_archived` | 歸檔練習 | `practice_id`: string |
| `check_in` | 完成打卡 | `practice_id`: string, `streak_count`: number, `has_note`: boolean, `has_media`: boolean (從 media array 長度推導), `mood?`: string, `is_first`: boolean |

**備註：**
- `frequency` 使用 codebase 中的 Frequency enum 字串值（`"2-4"`, `"3-5"`, `"4-7"`），不是數字
- `has_media` 取代原本的 `has_image`，從 form data 的 `media.length > 0` 推導
- `streak_count`: product app 需從 API response 取得（目前 mobile 有 `practice.currentStreak`，product app 需確認 API 是否回傳此欄位，若無則送 0）

### Content Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `content_viewed` | 查看練習或資源詳情頁 | `content_type`: "practice" \| "resource", `content_id`: string |
| `template_selected` | 選用模板建立練習 | `template_id`: string |

### Engagement Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `cta_clicked` | 點擊 CTA 按鈕 | `cta_id`: string, `page`: string, `section`: string |
| `newsletter_subscribed` | Footer 訂閱電子報成功 | — |
| `comment_created` | 發表留言 | `content_type`: "practice" \| "check_in", `content_id`: string |
| `share` | 分享內容 | `content_type`: "practice" \| "check_in" \| "quiz_result" \| "action_maker_result", `content_id`: string, `share_method?`: string |

**Migration mapping:** mobile 現有的 `share_check_in` 事件對應到 `share` + `content_type: "check_in"`

### Website Funnel Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `quiz_started` | 開始 Quiz | — |
| `quiz_completed` | 完成 Quiz 看到結果 | `result_theme`: string |
| `action_maker_started` | 開始 Action Maker 流程 | — |
| `action_maker_completed` | 完成 Action Maker 看到結果 | — |

### Generic Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `funnel_dropped` | 使用者離開未完成的流程 | `funnel_name`: "quiz" \| "action_maker" \| "practice_create", `last_step`: string |

**實作方式：** 在各流程的 layout/page 的 `beforeunload` 或 `useEffect cleanup` 中偵測使用者離開但未完成。需注意正常完成流程時不應觸發。

### Auto-Injected Properties (by tracker)

以下 properties 由 `trackUnifiedEvent()` 自動注入，不需要呼叫端傳入：

| Property | Type | Description |
|----------|------|-------------|
| `platform` | "web" \| "mobile" | 來源平台 |
| `app` | "website" \| "product" \| "mobile" | 來源 app |

### 未追蹤但保留擴充的事件

以下事件在產品規模成長後再加入：

| Event | Reason to defer |
|-------|----------------|
| `screen_view` | GA4/PostHog 自動追蹤 pageview，目前不需自訂。待跨平台 screen name 統一需求出現時再加 |
| `follow` / `unfollow` | 早期用戶量小，社交數據不夠看 |
| `reaction_added` | 細粒度社交行為，等留言追蹤驗證價值後再加 |
| `practice_edited` / `practice_deleted` | 編輯和刪除不影響核心漏斗 |

## Platform Limitations

| Platform | Limitation | Handling |
|----------|-----------|----------|
| **GA4** | 每事件最多 25 custom parameters | GA4 adapter 內建 truncation，超過的 params 靜默丟棄 |
| **GA4** | Key 最長 40 字元，value 最長 100 字元 | GA4 adapter 內建 sanitization（truncate） |
| **Clarity** | 不支援 event-level properties | Clarity adapter 只送 event name |
| **Clarity** | `identify` 支援 userId + optional sessionId/pageId | Clarity adapter 的 identify() 呼叫 `clarity("identify", userId)` |
| **Firebase** | 同 GA4 限制 (25 params, 40/100 char) | Firebase adapter 內建 sanitization（複用 mobile 現有的 `sanitizeFirebaseProperties` 邏輯） |

## CTA ID Reference

Landing Page 上的 CTA 按鈕對應的 `cta_id` 值：

| cta_id | Location | Action |
|--------|----------|--------|
| `header_join` | Header "立即加入" 按鈕 | 開啟登入 dialog |
| `hero_join` | KeyVision hero section CTA | 開啟登入 dialog |
| `community_join` | CommunitySection "加入等候清單" | 開啟登入 dialog |
| `join_section` | JoinSection "立即加入" | 開啟登入 dialog |
| `bottom_cta` | CallToActionSection 底部 CTA | 開啟登入 dialog |
| `plan_join` | PlanSection CTA | 開啟登入 dialog |
| `personality_test` | PersonalitySection quiz 入口 | 導航到 /quiz |
| `marathon_apply` | Learning Marathon "報名" | 開啟報名 modal |

## Key Funnels (for PostHog / GA4 setup)

### Activation Funnel
```
cta_clicked → signup → onboarding_completed → practice_created(is_first=true) → check_in(is_first=true)
```

### Quiz Conversion Funnel
```
cta_clicked(cta_id=personality_test) → quiz_started → quiz_completed
```

### Action Maker Conversion Funnel
```
action_maker_started → action_maker_completed
```

### Practice Creation Funnel
```
practice_create_started → template_selected? → practice_created
```

## Migration Plan

### Phase 1: Package Refactor
- 將 `packages/analytics` 拆為 `core/`（平台無關）和根目錄（web 專用）兩個 export path
- `core/` 不得依賴 `next`、`@daodao/config`、或任何 browser/native API
- 在 `core/` 實作事件型別定義、adapter interface、tracker
- 在根目錄實作 GA4、PostHog、Clarity 的 web adapter
- 現有的 `trackEvent`、`posthogCapture` 等改為內部呼叫 `trackUnifiedEvent` 的 wrapper，標記 `@deprecated`
- Deprecated API 將在 Phase 2 + Phase 3 完成後的下一個 release 移除

### Phase 2: Web Integration
- website app: 埋入行銷漏斗事件（cta_clicked、quiz_started/completed、action_maker_started/completed、newsletter_subscribed）
- product app: 埋入產品事件（practice_create_started、practice_created、check_in、content_viewed、comment_created、share）
- 兩個 app 的 global-provider 加入 `initTracker()` + `registerAdapter()` 初始化
- 登入流程加入 `identify()` 呼叫，登出加入 `reset()`
- 現有的 `content_viewed` 追蹤（practices/[id] 和 resource-detail）改用 `trackUnifiedEvent`

### Phase 3: Mobile Integration (可與 Phase 2 平行進行)
- 刪除 `apps/mobile/services/analytics.ts` 現有實作
- 改為 import `@daodao/analytics/core` 的事件定義和 tracker
- 實作 Firebase / PostHog / Clarity 的 mobile adapter 放在 `apps/mobile/adapters/`
- 註冊 adapters 並呼叫 `initTracker({ platform: "mobile", app: "mobile" })`
- 將現有的 `share_check_in` 改為 `share` + `content_type: "check_in"`

### Phase 4: Verify & Dashboard
- PostHog 建立上述四個 funnel
- GA4 設定 conversion events（signup、practice_created、check_in）
- 驗證跨平台事件名稱一致性
- 驗證 identify 後匿名事件正確 merge
- 用 PostHog 的 debug mode 或 GA4 DebugView 確認事件正確送達
