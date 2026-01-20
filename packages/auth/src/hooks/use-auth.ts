"use client";

import { useAuthContext } from "../lib/auth-provider";

/**
 * 使用認證狀態的 Hook
 * 提供使用者資訊、登入狀態和認證相關方法
 *
 * @example
 * ```typescript
 * const { user, isAuthenticated, login, logout } = useAuth();
 * ```
 */
export const useAuth = () => {
  return useAuthContext();
};
