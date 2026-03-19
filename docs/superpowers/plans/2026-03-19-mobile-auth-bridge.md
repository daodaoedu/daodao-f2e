# Mobile Auth Bridge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 讓 `@daodao/api` 的所有 hooks 在 `apps/mobile` 上能以 Bearer token 驗證，取代 mobile 自建的 `api-client.ts`。

**Architecture:** 在 `packages/api/src/client.ts` 加入 module-level 的 `_mobileTokenProvider`，讓 `wrapFetch` 依此切換 Bearer token 或 cookie 模式；新增 `initMobileClient()` 透過 openapi-fetch middleware 覆蓋 baseUrl；`AuthProvider` 在 mount 時注入、unmount 時清除。

> **重要技術細節**：openapi-fetch 0.15.0 的自訂 `fetch` 函式是以單一 `Request` object 呼叫（`fetch(request)`），`init` 永遠是 `undefined`。因此注入 header 時必須從 `input`（即 `Request` object）讀取現有 headers，不能依賴 `init?.headers`。

**Tech Stack:** openapi-fetch 0.15.0 (middleware API: `client.use()` / `client.eject()`), expo-secure-store, React useEffect

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

- [ ] `pnpm --filter @daodao/api typecheck` 通過
- [ ] `pnpm --filter @daodao/mobile typecheck` 通過
- [ ] Mobile app 登入後，`useCurrentUser()` 回傳正確的用戶資料（非 401 錯誤）
- [ ] Network request 帶有 `Authorization: Bearer xxx` header（可用 Proxyman/Charles 確認）
- [ ] `apps/product` 行為不受任何影響（web app 仍用 cookie auth）
- [ ] 所有改動已 commit

## 後續計畫

- **Plan 2**：Hooks 遷移（Phase 2）— 以 `@daodao/api` hooks 取代 mobile 自建的 `usePractices.ts`、`useCurrentUser.ts` 等，並刪除 `services/api-client.ts`
- **Plan 3**：P0 新頁面（Phase 3）— notifications、users/[identifier]、practices/[id]/summary、check-ins/[checkInId]
