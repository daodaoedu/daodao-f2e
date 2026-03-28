# Mobile ↔ Product 同步設計文件

**日期：** 2026-03-19
**分支：** feature/mobile-product-sync
**目標：** 讓 `apps/mobile` 功能對齊 `apps/product`，並將 API 層遷移到共用的 `@daodao/api`

---

## 1. 背景與目標

### 現狀
- `apps/product`：Next.js web app，使用 `@daodao/api` 所有 hooks + cookie-based auth
- `apps/mobile`：Expo React Native app，使用自建 `services/api-client.ts`（Bearer token auth）+ 自建 hooks（`usePractices.ts`、`useCurrentUser.ts` 等）
- Mobile 已部分使用 `@daodao/api`（`useRandomPracticeTemplates`、`useMutate`、`getTagPromptsByTags`），但只限於不需 auth 的端點

### 目標
1. **Track A — API 層遷移（B+C 的 C）**：讓 `@daodao/api` 支援 mobile 的 Bearer token 驗證，逐步替換 mobile 的自建 hooks
2. **Track B — 功能補齊（B+C 的 B）**：補實 product 有但 mobile 缺少的頁面

---

## 2. Track A：API Layer Auth Bridge

### 核心問題

`@daodao/api/src/client.ts` 有三個需要修改的地方：

1. **固定 `credentials: "include"`**：`wrapFetch` 和 `createClient` 都硬寫了 cookie auth，mobile 需要 Bearer token
2. **固定 baseUrl**：`createClient` 的 `baseUrl` 在 module load 時從 `getRequiredEnv("NEXT_PUBLIC_API_URL")` 讀取（`packages/config/generated/env.ts`），mobile 使用 `EXPO_PUBLIC_API_URL`
3. **`next` 直接依賴**：`packages/api/package.json` 列 `next` 為 dependency，Metro bundler 可能出錯

### 修改 packages/api/src/client.ts

新增 module-level token provider：

```ts
let _mobileTokenProvider: (() => Promise<string | null>) | null = null;

export function setMobileTokenProvider(fn: () => Promise<string | null>): void {
  _mobileTokenProvider = fn;
}
export function clearMobileTokenProvider(): void {
  _mobileTokenProvider = null;
}
```

**移除 `createClient` 頂層的 `credentials: "include"`**（否則 `init` 帶入 `wrapFetch` 時已包含此值，mobile path 無法覆蓋）：

```ts
// Before：
export const client = createClient<paths>({
  baseUrl: getRequiredEnv("NEXT_PUBLIC_API_URL"),
  credentials: "include",   // ← 移除
  fetch: ...,
});

// After：
export const client = createClient<paths>({
  baseUrl: getRequiredEnv("NEXT_PUBLIC_API_URL"),
  // credentials 改為在 wrapFetch 內依路徑設定
  fetch: typeof window === "undefined" ? fetch : unauthorizedHandler.wrapFetch,
});
```

**修改 `wrapFetch` 與新增 `_retryWithFreshToken`**（兩者皆為 `UnauthorizedHandler` class 的成員，保持在 class body 內以維持 `this` 綁定）：

```ts
wrapFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  let fetchInit: RequestInit;

  if (_mobileTokenProvider) {
    // Mobile path：Bearer token，不帶 credentials
    const token = await _mobileTokenProvider();
    fetchInit = {
      ...init,
      headers: {
        ...init?.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };
  } else {
    // Web path：維持現有 cookie 行為
    fetchInit = { ...init, credentials: "include" };
  }

  // URL 解析：Expo (Hermes) 已內建 URL global（since RN 0.63），不需額外 polyfill
  let url: string;
  if (typeof input === "string") url = input;
  else if (input instanceof URL) url = input.toString();
  else url = input.url;

  const response = await fetch(input, fetchInit);

  // 如果不是 401 或沒有處理器，直接返回
  if (response.status !== 401 || !this.onUnauthorized) return response;

  // 避免 refresh endpoint 死鎖
  if (url.includes("/api/v1/auth/refresh")) return response;

  // 若已在刷新中，等待
  if (this.isRefreshing && this.refreshPromise) {
    const ok = await this.refreshPromise;
    if (!ok) return response;
    // refresh 成功後重試，重新取 token
    return this._retryWithFreshToken(input, fetchInit);
  }

  // 開始刷新
  this.isRefreshing = true;
  this.refreshPromise = this.onUnauthorized();
  try {
    const ok = await this.refreshPromise;
    if (!ok) return response;
    return this._retryWithFreshToken(input, fetchInit);
  } finally {
    this.isRefreshing = false;
    this.refreshPromise = null;
  }
};

// 新增 private helper（同在 UnauthorizedHandler class 內）
// fetchInit 傳入是為了保留非 auth 的 headers/method/body 等，
// Authorization header 會被重新取值覆蓋，不使用 fetchInit 內的舊 token
private async _retryWithFreshToken(
  input: RequestInfo | URL,
  fetchInit: RequestInit
): Promise<Response> {
  if (_mobileTokenProvider) {
    const newToken = await _mobileTokenProvider(); // 取 refresh 後的新 token
    return fetch(input, {
      ...fetchInit,
      headers: {
        ...fetchInit.headers,
        ...(newToken ? { Authorization: `Bearer ${newToken}` } : {}),
      },
    });
  }
  return fetch(input, fetchInit); // web：cookie 已由 refresh 更新，fetchInit 直接重用
}
```

新增 `initMobileClient` / `clearMobileClient` 函式（統一 mobile 初始化入口）：

```ts
// openapi-fetch 0.15.0 無 setBaseUrl — 改用 client.use() middleware 覆蓋 baseUrl
import type { Middleware } from 'openapi-fetch';

let _baseUrlMiddleware: Middleware | null = null;

export function initMobileClient(config: {
  baseUrl: string;
  getToken: () => Promise<string | null>;
}): void {
  setMobileTokenProvider(config.getToken);

  // 移除舊 middleware（防止 Fast Refresh 重複註冊）
  if (_baseUrlMiddleware) client.eject(_baseUrlMiddleware);

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

export function clearMobileClient(): void {
  clearMobileTokenProvider();
  if (_baseUrlMiddleware) {
    client.eject(_baseUrlMiddleware);
    _baseUrlMiddleware = null;
  }
}
```

> **為什麼需要 middleware**：`createClient` 在 module load 時就執行，`baseUrl` 來自 `getRequiredEnv("NEXT_PUBLIC_API_URL")`（讀 `packages/config/generated/env.ts`，目前固定 `localhost:4000`）。`openapi-fetch` 0.15.0 的 client 無 `setBaseUrl` 方法，唯一的 post-creation override 方式是 `client.use()` middleware。Mobile `initMobileClient` 透過 middleware 覆蓋 host/protocol/port，確保所有請求打到正確的 API server。

> **module load 不 crash**：`packages/config/generated/env.ts` 已有 `NEXT_PUBLIC_API_URL` fallback 值，所以 module import 不會拋錯。Mobile 的 middleware 在 `initMobileClient` 時覆蓋到正確的 `EXPO_PUBLIC_API_URL`。

新增 export 到 `packages/api/src/index.ts`：
```ts
export { setMobileTokenProvider, clearMobileTokenProvider, initMobileClient, clearMobileClient } from './client';
```

### 修改 packages/api/package.json

將 `next` 從 `dependencies` 移到 `peerDependencies`（標記為 optional）：

```json
{
  "peerDependencies": {
    "next": ">=15.0.0",
    "react": "catalog:"
  },
  "peerDependenciesMeta": {
    "next": { "optional": true }
  }
}
```

這樣 Metro bundler 不會嘗試 bundle `next`，product 的 Next.js 安裝仍然滿足 peer dep。

### auth-storage.ts：新增 refreshTokens()

將現有 `api-client.ts` 的 `refreshAccessToken()` 邏輯移到 `auth-storage.ts`：

```ts
// apps/mobile/services/auth-storage.ts 新增
export async function refreshTokens(): Promise<void> {
  const refreshToken = await authStorage.getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token");

  const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    await authStorage.clearAll();
    throw new Error("Token refresh failed");
  }

  const data = await response.json();
  await authStorage.setTokens(data);
}
```

### Mobile AuthProvider 初始化

```ts
// apps/mobile/providers/AuthProvider.tsx
import { initMobileClient, clearMobileClient, unauthorizedHandler } from '@daodao/api';
import { authStorage, refreshTokens } from '@/services/auth-storage';

useEffect(() => {
  // initMobileClient 內部用 client.use() middleware 覆蓋 baseUrl
  // 並設定 _mobileTokenProvider（Bearer token）
  initMobileClient({
    baseUrl: process.env.EXPO_PUBLIC_API_URL ?? 'https://api.daodao.so',
    getToken: () => authStorage.getAccessToken(),
  });

  // 401 refresh handler（wrapFetch 邏輯在 UnauthorizedHandler class 內，this 綁定正確）
  unauthorizedHandler.setHandler(async () => {
    try {
      await refreshTokens();
      return true;
    } catch {
      return false;
    }
  });

  return () => {
    // cleanup：避免 Fast Refresh 重複註冊 middleware / handler
    clearMobileClient();
    unauthorizedHandler.clearHandler();
  };
}, []);
```

### 退場計劃
`services/api-client.ts` 確認所有呼叫端遷移完畢後刪除（Phase 2 末）。

---

## 3. Track A：Mobile Hooks 遷移

### 遷移對照表

| Mobile 自建 | 替換為 `@daodao/api` | 注意事項 |
|---|---|---|
| `usePractices()` | `useMyPractices()` | derived state 邏輯移到 `usePracticeGroups()` wrapper |
| `usePractice(id)` | `usePracticeById(id)` | 直接替換 |
| `useCheckIns(id)` | `usePracticeCheckIns(id)` | checkInDates 轉換邏輯保留在 wrapper |
| `useCheckIn()` | `useCreateCheckIn()` | 直接替換 |
| `useCurrentUser()` | `useMe()` | 直接替換 |

### usePracticeGroups wrapper

`usePractices()` 目前回傳 derived state（`activePractices`、`todayPending` 等）。遷移到 `useMyPractices()` 後，這些邏輯移到 **`apps/mobile/hooks/use-practice-groups.ts`**（mobile-only wrapper）：

```ts
// apps/mobile/hooks/use-practice-groups.ts
export function usePracticeGroups() {
  const { data } = useMyPractices();
  return useMemo(() => computeGroups(data?.practices ?? []), [data]);
}
```

所有原本呼叫 `usePractices()` 的地方改為 `usePracticeGroups()`。

### 保留不遷移（mobile-specific）
- `hooks/useShare.ts` — 使用 `expo-sharing`，無 web 對應
- `hooks/useAnalytics.ts` — 使用 Firebase SDK
- `services/auth-storage.ts` — AsyncStorage 邏輯
- `services/oauth.ts` — Expo OAuth 流程
- `services/notifications.ts` — Expo Push Notifications

### 遷移策略
1. Auth bridge 上線並驗證 token 注入正常
2. 逐 hook 替換：每次一個，手動測試畫面正常後提交
3. 全部完成後刪除 `services/api-client.ts` 和已退役的 hooks

---

## 4. Track B：新功能頁面

### P0 — 高頻核心

| Screen | 路由（mobile） | 對應 product | 主要 hooks |
|---|---|---|---|
| 通知 | `notifications/index.tsx` | `/notifications` | `useNotifications()` |
| 用戶主頁 | `users/[identifier].tsx` | `/users/[identifier]` | `useUserByIdentifier()`, `useUserPractices()` |
| 實踐總結 | `practices/[id]/summary.tsx` | `/practices/[id]/summary` | `usePracticeById()`, `usePracticeStats()` |
| Check-in 詳情 | `practices/[id]/check-ins/[checkInId].tsx` | `/practices/[id]/check-ins/[checkInId]` | `useCheckInById()` |

### P1 — 社交功能

| Screen | 路由（mobile） | 對應 product |
|---|---|---|
| Social 動態流 | `(tabs)/social.tsx` | `/social` |
| 足跡 | `me/footprints.tsx` | `/me/footprints` |
| 追蹤中 | `settings/following.tsx` | `/settings/following` |
| 連接 | `settings/connections.tsx` | `/settings/connections` |

### P2 — Settings 補齊

| Screen | 對應 product |
|---|---|
| `settings/interaction.tsx` | `/settings/interaction` |
| `settings/preferences.tsx` | `/settings/preferences` |
| `settings/public-info.tsx` | `/settings/public-info` |

### P2 — Resource 區塊

| Screen | 對應 product |
|---|---|
| `resource/index.tsx` | `/resource` |
| `resource/[resourceId].tsx` | `/resource/[resourceId]` |
| `resource/categories/index.tsx` | `/resource/categories` |
| `resource/categories/[...categories].tsx` | `/resource/categories/[...categories]` |

**Admin 頁面不實作**（mobile 不需要）

### Navigation 調整

現有 tab bar：`home | explore | create | profile`

調整為：`home | explore | social | create | profile`

通知入口：在 home header 右上角加 bell icon（badge 顯示未讀數），點進 `notifications/` 路由。

---

## 5. 元件策略

新頁面的 UI 元件：
- 使用 **Tamagui**（現有 mobile UI 框架），不引入 product 的 `@daodao/ui`
- 參考 product 頁面的邏輯和版面結構，重新以 mobile 語意實作
- 可複用 mobile 現有元件：`PracticeCard`、`CheckInList`、`IslandCard` 等

---

## 6. 實作順序

```
Phase 1：Auth Bridge（Track A 基礎）⬅ Phase 3 開始前的 gate
  ├─ packages/api/package.json：next 移到 peerDependencies（optional）
  ├─ packages/api/src/client.ts：加 setMobileTokenProvider / initMobileClient / 修改 wrapFetch
  ├─ packages/api/src/index.ts：export 新 API
  ├─ apps/mobile/services/auth-storage.ts：新增 refreshTokens()
  ├─ apps/mobile/providers/AuthProvider.tsx：呼叫 initMobileClient + setHandler + cleanup
  └─ 驗證 gate：useMe() 在 mobile 正確回傳 authed 資料後，才開啟 Phase 2 & 3

Phase 2：Hooks 遷移（Track A）
  ├─ usePractices → useMyPractices + usePracticeGroups wrapper
  ├─ usePractice → usePracticeById
  ├─ useCheckIns → usePracticeCheckIns
  ├─ useCheckIn → useCreateCheckIn
  ├─ useCurrentUser → useMe
  └─ 刪除 services/api-client.ts 和退役 hooks

Phase 3：P0 新頁面（Track B，與 Phase 2 並行）
  ├─ notifications/
  ├─ users/[identifier]
  ├─ practices/[id]/summary
  └─ practices/[id]/check-ins/[checkInId]

Phase 4：P1 新頁面 + Nav 調整
  ├─ (tabs)/social
  ├─ me/footprints
  ├─ settings/following + connections
  └─ Tab bar 調整

Phase 5：P2 新頁面
  ├─ settings/interaction + preferences + public-info
  └─ resource/ 整個區塊
```

---

## 7. 不在範圍內

- `apps/product` 的任何修改（`packages/api` 的 auth bridge 改動不影響 product）
- `apps/admin` 頁面移植
- i18n（mobile 暫不引入 `@daodao/i18n`）
- `@daodao/ui` 元件引入（mobile 維持 Tamagui）
