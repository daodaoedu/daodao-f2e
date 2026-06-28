"use client";

import { getStorage, StorageEnum } from "@daodao/shared";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { decodeOAuthState, verifyAndConsumeOAuthState } from "../lib/auth-client";
import { DEFAULT_REDIRECT_URL, ONBOARDING_URL } from "../lib/auth-constants";

/**
 * 登入後跳轉的 Hook
 * 在 OAuth callback 頁面使用，處理登入後的跳轉邏輯
 *
 * 流程說明：
 * 1. 解碼並驗證 OAuth state 參數
 * 2. 檢查是否為新用戶（isNewUser URL 參數）
 * 3. 新用戶跳轉到 onboarding 流程
 * 4. 舊用戶跳轉到原目標頁面
 *
 * @example
 * ```typescript
 * export default function AuthCallbackPage() {
 *   useRedirectAfterLogin();
 *   return <div>Redirecting...</div>;
 * }
 * ```
 */

// 整頁重新載入而非 client-side router.push：
// - 確保 AuthProvider 重 mount，checkAuth 在新 session cookie 就緒後重跑，
//   避免 isAuthenticated 還是上一頁的 false 就觸發路由保護把使用者踢回登入頁
// - 避開 next/navigation 的 router.push 不帶 locale prefix 在 next-intl 路由下的不一致行為
const hardNavigate = (url: string) => {
  window.location.href = url;
};

export const useRedirectAfterLogin = () => {
  const searchParams = useSearchParams();

  useEffect(() => {
    const stateParam = searchParams.get("state");
    const isNewUser = searchParams.get("isNewUser") === "true";

    // 通知其他 tab/window OAuth 已完成（處理 Android Chrome Custom Tab 場景）
    // CCT 與主 Chrome 共享 localStorage，主 tab 可以透過 storage event 偵測並重新驗證
    getStorage<number>(StorageEnum.AuthSignal).set(Date.now());

    if (!stateParam) {
      // 沒有 state 參數，根據是否為新用戶決定跳轉
      if (isNewUser) {
        hardNavigate(ONBOARDING_URL);
      } else {
        hardNavigate(DEFAULT_REDIRECT_URL);
      }
      return;
    }

    // 解碼 state 參數
    const state = decodeOAuthState(stateParam);
    if (!state) {
      // State 格式錯誤，根據是否為新用戶決定跳轉
      if (isNewUser) {
        hardNavigate(ONBOARDING_URL);
      } else {
        hardNavigate(DEFAULT_REDIRECT_URL);
      }
      return;
    }

    // 驗證並消費 state（會驗證 nonce 並清除，防止重放攻擊）
    if (!verifyAndConsumeOAuthState(state)) {
      // State 無效、過期或 nonce 不匹配，根據是否為新用戶決定跳轉
      if (isNewUser) {
        hardNavigate(ONBOARDING_URL);
      } else {
        hardNavigate(DEFAULT_REDIRECT_URL);
      }
      return;
    }

    // 驗證成功
    if (isNewUser) {
      // 新用戶跳轉到 onboarding 流程
      hardNavigate(ONBOARDING_URL);
    } else {
      // 舊用戶跳轉到原目標頁面
      // 過濾掉不適合作為登入後落地頁的路徑（設定頁、錯誤頁）
      const redirectUrl = state.redirectUrl ?? DEFAULT_REDIRECT_URL;
      const isUnwantedLanding =
        redirectUrl.includes("/auth/error") || redirectUrl.includes("/settings");
      hardNavigate(isUnwantedLanding ? DEFAULT_REDIRECT_URL : redirectUrl);
    }
  }, [searchParams]);
};
