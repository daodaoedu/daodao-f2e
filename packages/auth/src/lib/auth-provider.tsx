"use client";

import {
  logout as apiLogout,
  refreshToken as apiRefreshToken,
  getCurrentUser,
  unauthorizedHandler,
} from "@daodao/api";
import { getStorage, getStorageKey, StorageEnum } from "@daodao/shared";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { LoginDialog } from "../components/login-dialog";
import type { AuthContextValue, StoredUser } from "../types";
import { initiateOAuthLogin } from "./auth-client";
import { DEFAULT_REDIRECT_URL } from "./auth-constants";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Auth Provider 組件
 * 提供全域認證狀態管理
 */
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [loginDialogRedirectUrl, setLoginDialogRedirectUrl] = useState<string | undefined>();
  const [loginDialogSource, setLoginDialogSource] = useState<"website" | "app" | undefined>();
  const userInfoStorage = useMemo(() => getStorage<StoredUser>(StorageEnum.UserInfo), []);
  const _router = useRouter();

  /**
   * 清除認證狀態
   * 統一處理使用者狀態清除邏輯
   */
  const clearAuthState = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    userInfoStorage.remove();
  }, [userInfoStorage]);

  /**
   * 設定認證狀態
   * 統一處理使用者狀態設定邏輯
   */
  const setAuthState = useCallback(
    (storedUser: StoredUser) => {
      setUser(storedUser);
      setIsAuthenticated(true);
      userInfoStorage.set(storedUser);
    },
    [userInfoStorage]
  );

  /**
   * 檢查登入狀態
   * 使用統一的 API 服務獲取當前用戶資訊
   */
  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getCurrentUser();

      if (response.data && response.response.ok && response.data.data) {
        const userData = response.data.data;
        // 將完整的 API 使用者資訊轉換為簡化的存儲版本，避免記住敏感資訊
        const storedUser: StoredUser = {
          id: userData.id,
          customId: userData.customId ?? null,
          email: userData.email ?? null,
          name: userData.name ?? null,
          photoUrl: userData.photoURL ?? null,
        };
        setAuthState(storedUser);
      } else {
        // 未登入或 Token 無效
        clearAuthState();
      }
    } catch (error) {
      console.error("Failed to check auth status:", error);
      clearAuthState();
    } finally {
      setIsLoading(false);
    }
  }, [clearAuthState, setAuthState]);

  /**
   * Token 刷新邏輯
   * 使用統一的 API 服務刷新 Token
   */
  const handleTokenRefresh = useCallback(async (): Promise<boolean> => {
    try {
      const response = await apiRefreshToken();
      if (response.data && response.response.ok) {
        // Token 刷新成功，重新檢查登入狀態
        await checkAuth();
        return true;
      }
      // Token 刷新失敗
      return false;
    } catch (error) {
      console.error("Failed to refresh token:", error);
      return false;
    }
  }, [checkAuth]);

  /**
   * 註冊 401 錯誤處理器（自動刷新 Token）
   */
  useEffect(() => {
    // 註冊 401 處理器
    unauthorizedHandler.setHandler(handleTokenRefresh);

    // 清理時移除處理器
    return () => {
      unauthorizedHandler.clearHandler();
    };
  }, [handleTokenRefresh]);

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
          clearAuthState();
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [userInfoStorage, clearAuthState]);

  /**
   * 開啟登入 Dialog
   */
  const openLoginDialog = useCallback(
    (options?: { redirectUrl?: string; source?: "website" | "app" }) => {
      if (options?.redirectUrl) {
        setLoginDialogRedirectUrl(options.redirectUrl);
      } else {
        setLoginDialogRedirectUrl(undefined);
      }
      if (options?.source) {
        setLoginDialogSource(options.source);
      } else {
        setLoginDialogSource(undefined);
      }
      setIsLoginDialogOpen(true);
    },
    []
  );

  /**
   * 需要登入時自動打開 Dialog，如果已登入則執行回調
   */
  const requireAuth = useCallback(
    <T,>(
      callback: () => T | Promise<T>,
      options?: { redirectUrl?: string; source?: "website" | "app" }
    ): T | Promise<T> | undefined => {
      if (isAuthenticated) {
        return callback();
      }
      openLoginDialog(options);
    },
    [isAuthenticated, openLoginDialog]
  );

  /**
   * 登入
   * 開啟登入 Dialog（不再直接啟動 OAuth 流程）
   */
  const login = useCallback(
    async (redirectUrl?: string) => {
      openLoginDialog({ redirectUrl });
    },
    [openLoginDialog]
  );

  /**
   * 處理登入 Dialog 中的 Google 登入
   */
  const handleGoogleLogin = useCallback(() => {
    const redirectUrl = loginDialogRedirectUrl || DEFAULT_REDIRECT_URL;
    const source =
      loginDialogSource || (window.location.hostname.includes("app.") ? "app" : "website");
    setIsLoginDialogOpen(false);
    initiateOAuthLogin(redirectUrl, source);
  }, [loginDialogRedirectUrl, loginDialogSource]);

  /**
   * 登出
   * 使用統一的 API 服務登出
   */
  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error("Failed to logout:", error);
    } finally {
      // 無論 API 是否成功，都清除前端狀態
      clearAuthState();
    }
  }, [clearAuthState]);

  /**
   * 刷新 Token
   * 呼叫後端 API 刷新 Token（後端會更新 Cookie）
   */
  const refreshToken = useCallback(async () => {
    const refreshSuccess = await handleTokenRefresh();
    if (!refreshSuccess) {
      // Token 刷新失敗，清除狀態並打開登入 Dialog
      clearAuthState();
      openLoginDialog();
    }
  }, [handleTokenRefresh, clearAuthState, openLoginDialog]);

  const value: AuthContextValue = useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      login,
      logout,
      refreshToken,
      openLoginDialog,
      requireAuth,
    }),
    [user, isAuthenticated, isLoading, login, logout, refreshToken, openLoginDialog, requireAuth]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <LoginDialog
        open={isLoginDialogOpen}
        onOpenChange={setIsLoginDialogOpen}
        redirectUrl={loginDialogRedirectUrl}
        source={loginDialogSource}
        onLogin={handleGoogleLogin}
      />
    </AuthContext.Provider>
  );
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
