"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { decodeOAuthState, verifyAndConsumeOAuthState } from "../lib/auth-client";
import { DEFAULT_REDIRECT_URL } from "../lib/auth-constants";

/**
 * 登入後跳轉的 Hook
 * 在 OAuth callback 頁面使用，處理登入後的跳轉邏輯
 *
 * @example
 * ```typescript
 * export default function AuthCallbackPage() {
 *   useRedirectAfterLogin();
 *   return <div>Redirecting...</div>;
 * }
 * ```
 */
export const useRedirectAfterLogin = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const stateParam = searchParams.get("state");

    if (!stateParam) {
      // 沒有 state 參數，跳轉到預設頁面
      router.push(DEFAULT_REDIRECT_URL);
      return;
    }

    // 解碼 state 參數
    const state = decodeOAuthState(stateParam);
    if (!state) {
      // State 格式錯誤，跳轉到預設頁面
      router.push(DEFAULT_REDIRECT_URL);
      return;
    }

    // 驗證並消費 state（會驗證 nonce 並清除，防止重放攻擊）
    if (!verifyAndConsumeOAuthState(state)) {
      // State 無效、過期或 nonce 不匹配，跳轉到預設頁面
      router.push(DEFAULT_REDIRECT_URL);
      return;
    }

    // 驗證成功，跳轉到目標頁面
    router.push(state.redirectUrl);
  }, [searchParams, router]);
};
