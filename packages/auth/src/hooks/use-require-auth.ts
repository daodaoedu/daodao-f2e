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
 *
 * @remarks
 * 此 hook 適用於以下情境：
 * - Website app：大部分頁面公開，只有少數頁面需要保護
 * - 條件式保護：需要根據客戶端狀態決定是否保護
 * - 動態路由保護：需要載入資料後才能判斷權限
 *
 * 對於 Product app，建議使用 Middleware 在服務器端選擇要公開的路徑，預設為保護。
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

