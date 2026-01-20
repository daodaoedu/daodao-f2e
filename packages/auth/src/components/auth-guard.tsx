"use client";

import { useAuth } from "../hooks/use-auth";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * 路由保護組件
 * 檢查登入狀態，未登入時顯示 fallback
 *
 * @example
 * ```typescript
 * <AuthGuard fallback={<div>Please login</div>}>
 *   <div>Protected Content</div>
 * </AuthGuard>
 * ```
 *
 * @remarks
 * 此組件用於需要根據認證狀態顯示不同內容的情況。
 * 如果需要自動跳轉到登入頁，請使用 `useRequireAuth()` hook：
 * ```typescript
 * export default function ProtectedPage() {
 *   useRequireAuth();
 *   return <div>Protected Content</div>;
 * }
 * ```
 *
 * 對於 Product app，路由保護主要由 Middleware 在服務器端處理。
 * 對於 Website app，可以使用 `useRequireAuth()` 進行客戶端保護。
 */
export const AuthGuard = ({ children, fallback = null }: AuthGuardProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
