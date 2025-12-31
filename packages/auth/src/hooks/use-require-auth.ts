"use client";

import { useEffect } from "react";
import { redirectTo } from "../utils/redirect";
import { useAuth } from "./use-auth";

/**
 * 需要登入的 Hook
 * 在頁面組件中使用，自動處理未登入狀態
 *
 * @param redirectUrl 未登入時跳轉的 URL（預設: /auth/login）
 *
 * @example
 * ```typescript
 * export default function ProtectedPage() {
 *   useRequireAuth();
 *   return <div>Protected Content</div>;
 * }
 * ```
 */
export const useRequireAuth = (redirectUrl: string = "/auth/login") => {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // 保留當前 URL 作為 redirect 參數
      const currentUrl = window.location.pathname + window.location.search;
      redirectTo(`${redirectUrl}?redirect=${encodeURIComponent(currentUrl)}`);
    }
  }, [isAuthenticated, isLoading, redirectUrl]);
};
