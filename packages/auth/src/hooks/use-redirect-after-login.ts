"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { getStorage, StorageEnum } from "@daodao/shared";
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
export const useRedirectAfterLogin = () => {
  const router = useRouter();
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
        router.push(ONBOARDING_URL);
      } else {
        router.push(DEFAULT_REDIRECT_URL);
      }
      return;
    }

    // 解碼 state 參數
    const state = decodeOAuthState(stateParam);
    if (!state) {
      // State 格式錯誤，根據是否為新用戶決定跳轉
      if (isNewUser) {
        router.push(ONBOARDING_URL);
      } else {
        router.push(DEFAULT_REDIRECT_URL);
      }
      return;
    }

    // 驗證並消費 state（會驗證 nonce 並清除，防止重放攻擊）
    if (!verifyAndConsumeOAuthState(state)) {
      // State 無效、過期或 nonce 不匹配，根據是否為新用戶決定跳轉
      if (isNewUser) {
        router.push(ONBOARDING_URL);
      } else {
        router.push(DEFAULT_REDIRECT_URL);
      }
      return;
    }

    // 驗證成功
    if (isNewUser) {
      // 新用戶跳轉到 onboarding 流程
      router.push(ONBOARDING_URL);
    } else {
      // 舊用戶跳轉到原目標頁面
      router.push(state.redirectUrl);
    }
  }, [searchParams, router]);
};
