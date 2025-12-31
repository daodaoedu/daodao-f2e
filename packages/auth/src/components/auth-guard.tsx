"use client";

import { useAuth } from "../hooks/use-auth";
import { useRequireAuth } from "../hooks/use-require-auth";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

/**
 * 路由保護組件
 * 檢查登入狀態，未登入時顯示 fallback 或跳轉
 *
 * @example
 * ```typescript
 * <AuthGuard fallback={<div>Please login</div>}>
 *   <div>Protected Content</div>
 * </AuthGuard>
 * ```
 */
export const AuthGuard = ({ children, fallback = null, redirectTo }: AuthGuardProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  // 如果有指定跳轉 URL，使用 useRequireAuth 處理
  if (redirectTo) {
    useRequireAuth(redirectTo);
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
