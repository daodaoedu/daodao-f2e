"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "./use-auth";

const LOGIN_URL = "/auth/login";

/**
 * 需要登入的 Hook
 * 在頁面組件中使用，自動處理未登入狀態
 *
 * @param redirectUrl 登入後要跳轉的 URL（預設: 當前頁面 URL）
 *
 * @example
 * ```typescript
 * // 登入後回到當前頁面
 * export default function ProtectedPage() {
 *   useRequireAuth();
 *   return <div>Protected Content</div>;
 * }
 *
 * // 登入後跳轉到指定頁面
 * export default function ProtectedPage() {
 *   useRequireAuth("/dashboard");
 *   return <div>Protected Content</div>;
 * }
 * ```
 */
export const useRequireAuth = (redirectUrl?: string) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // 如果指定了 redirectUrl，使用指定的 URL；否則使用當前 URL
      const targetUrl = redirectUrl ?? window.location.pathname + window.location.search;
      router.push(`${LOGIN_URL}?redirect=${encodeURIComponent(targetUrl)}`);
    }
  }, [isAuthenticated, isLoading, redirectUrl, router]);
};
