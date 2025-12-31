"use client";

import { client, unauthorizedHandler } from "@daodao/api";
import { getStorage, getStorageKey, StorageEnum } from "@daodao/shared";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { AuthContextValue, StoredUser, User } from "../types";
import { redirectTo } from "../utils/redirect";
import { initiateOAuthLogin } from "./auth-client";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * 將完整的 API 使用者資訊轉換為簡化的存儲版本
 * 僅保留非敏感資料
 */
const convertToStoredUser = (user: User): StoredUser => {
  return {
    id: user.id,
    email: user.email ?? null,
    name: user.name ?? null,
    photoUrl: user.photoURL ?? null,
  };
};

/**
 * Auth Provider 組件
 * 提供全域認證狀態管理
 */
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const userInfoStorage = useMemo(() => getStorage<StoredUser>(StorageEnum.UserInfo), []);

  /**
   * 檢查登入狀態
   * 呼叫 /api/v1/me/auth 端點（Cookie 自動發送）
   */
  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await client.GET("/api/v1/users/me");

      if (response.data && response.response.ok) {
        const userData = response.data.data;

        if (userData) {
          // 將完整的 API 使用者資訊轉換為簡化的存儲版本
          const storedUser = convertToStoredUser(userData);
          setUser(storedUser);
          setIsAuthenticated(true);
          // 將使用者資訊存到 localStorage（非敏感資料）
          userInfoStorage.set(storedUser);
        } else {
          // 如果沒有使用者資訊，清除狀態
          setUser(null);
          setIsAuthenticated(false);
          userInfoStorage.remove();
        }
      } else {
        // 未登入或 Token 無效
        setUser(null);
        setIsAuthenticated(false);
        userInfoStorage.remove();
      }
    } catch (error) {
      console.error("Failed to check auth status:", error);
      setUser(null);
      setIsAuthenticated(false);
      userInfoStorage.remove();
    } finally {
      setIsLoading(false);
    }
  }, [userInfoStorage]);

  /**
   * 註冊 401 錯誤處理器（自動刷新 Token）
   */
  useEffect(() => {
    // 註冊 401 處理器
    unauthorizedHandler.setHandler(async () => {
      try {
        const response = await client.POST("/api/v1/auth/refresh");
        if (response.data && response.response.ok) {
          // Token 刷新成功
          return true;
        }
        // Token 刷新失敗
        return false;
      } catch (error) {
        console.error("Failed to refresh token on 401:", error);
        return false;
      }
    });

    // 清理時移除處理器
    return () => {
      unauthorizedHandler.clearHandler();
    };
  }, []);

  /**
   * 初始化時檢查登入狀態
   */
  useEffect(() => {
    // 先從 localStorage 讀取使用者資訊（快速顯示）
    const cachedUser = userInfoStorage.get();
    if (cachedUser) {
      setUser(cachedUser);
      setIsAuthenticated(true);
      setIsLoading(false);
    }

    // 然後呼叫 API 驗證實際狀態
    checkAuth();
  }, [checkAuth, userInfoStorage]);

  /**
   * 跨 Tab 同步使用者資訊（非 Cookie）
   * 監聽 localStorage 變化事件
   */
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // 檢查是否是使用者資訊的變化
      if (e.key === getStorageKey(StorageEnum.UserInfo)) {
        const newUserInfo = userInfoStorage.get();
        if (newUserInfo) {
          setUser(newUserInfo);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [userInfoStorage]);

  /**
   * 登入
   * 啟動 OAuth 流程
   */
  const login = useCallback(async (redirectUrl?: string) => {
    const defaultRedirect = redirectUrl || "/dashboard";
    const source =
      typeof window !== "undefined" && window.location.hostname.includes("app.")
        ? "app"
        : "website";
    initiateOAuthLogin(defaultRedirect, source);
  }, []);

  /**
   * 登出
   * 呼叫後端 API 清除 Cookie
   */
  const logout = useCallback(async () => {
    try {
      await client.POST("/api/v1/auth/logout");
    } catch (error) {
      console.error("Failed to logout:", error);
    } finally {
      // 無論 API 是否成功，都清除前端狀態
      setUser(null);
      setIsAuthenticated(false);
      userInfoStorage.remove();
    }
  }, [userInfoStorage]);

  /**
   * 刷新 Token
   * 呼叫後端 API 刷新 Token（後端會更新 Cookie）
   */
  const refreshToken = useCallback(async () => {
    try {
      const response = await client.POST("/api/v1/auth/refresh");
      if (response.data && response.response.ok) {
        // Token 刷新成功，重新檢查登入狀態
        await checkAuth();
      } else {
        // Token 刷新失敗，清除狀態並跳轉登入頁
        setUser(null);
        setIsAuthenticated(false);
        userInfoStorage.remove();
        redirectTo("/auth/login");
      }
    } catch (error) {
      console.error("Failed to refresh token:", error);
      setUser(null);
      setIsAuthenticated(false);
      userInfoStorage.remove();
      redirectTo("/auth/login");
    }
  }, [checkAuth, userInfoStorage]);

  /**
   * 跳轉到指定 URL
   */
  const handleRedirectTo = useCallback((url: string) => {
    redirectTo(url);
  }, []);

  const value: AuthContextValue = useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      login,
      logout,
      refreshToken,
      redirectTo: handleRedirectTo,
    }),
    [user, isAuthenticated, isLoading, login, logout, refreshToken, handleRedirectTo]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * 使用 Auth Context 的 Hook
 * 必須在 AuthProvider 內部使用
 */
export const useAuthContext = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
};
