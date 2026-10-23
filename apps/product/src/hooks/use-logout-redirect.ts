"use client";

import { useAuth } from "@daodao/auth";
import { useCallback } from "react";
import { useSWRConfig } from "swr";
import { getPostLogoutLoginPath } from "@/lib/auth/post-logout";

/**
 * 登出並導向登入頁（daodao#346）。
 *
 * 只呼叫 `useAuth().logout()` 會停在原頁；訪客版首頁沒有登入入口，使用者找不到再次登入的地方。
 * 所有登出入口（設定頁、側欄帳號選單、手機版選單）都走這支。
 */
export function useLogoutAndRedirect() {
  const { logout } = useAuth();
  const { cache } = useSWRConfig();

  return useCallback(async () => {
    await logout();

    if (cache instanceof Map) {
      cache.clear();
    }

    // 用 hard navigation 切斷 route protection 的競態 redirect
    window.location.href = getPostLogoutLoginPath(window.location.pathname);
  }, [logout, cache]);
}
