"use client";

import {
  logout as apiLogout,
  refreshToken as apiRefreshToken,
  getAuthMe,
  unauthorizedHandler,
} from "@daodao/api";
import { usePathname } from "@daodao/i18n/navigation";
import { routing } from "@daodao/i18n/routing";
import { getStorage, getStorageKey, StorageEnum } from "@daodao/shared";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { LoginDialog } from "../components/login-dialog";
import type { AuthContextValue, StoredUser } from "../types";
import { initiateOAuthLogin } from "./auth-client";
import { DEFAULT_REDIRECT_URL } from "./auth-constants";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * 路徑匹配模式類型
 * 可以是單一字串（正則表達式字串）或字串陣列（正則表達式字串陣列）
 */
export type PathPattern = string | string[];

/**
 * 路由保護配置選項
 */
export interface AuthProviderRouteConfig {
  /**
   * 公開路徑模式（不需要登入）
   * 這些路徑即使未登入也可以訪問
   * 可以是：
   * - 字串（正則表達式字串，用於匹配路徑）
   * - 字串陣列（正則表達式字串陣列）
   */
  publicPattern?: PathPattern;

  /**
   * 需要保護的路徑模式（正則表達式字串）
   * 這些路徑需要登入才能訪問
   * 可以是：
   * - 字串（正則表達式字串，用於匹配路徑）
   * - 字串陣列（正則表達式字串陣列）
   * 如果指定了 protectedPattern，只保護這些路徑
   * 如果 protectedPattern 為空，則根據 defaultProtected 設定決定是否保護所有路徑
   */
  protectedPattern?: PathPattern;

  /**
   * 當 protectedPattern 為空時，預設是否保護所有路徑
   * 預設: true（保護所有路徑，除了 publicPattern 指定的路徑）
   * 設為 false 時，只有 publicPattern 指定的路徑是公開的，其他路徑都需要保護
   */
  defaultProtected?: boolean;

  /**
   * 是否啟用路由保護
   * 預設: true
   */
  enableRouteProtection?: boolean;

  /**
   * 當路徑需要保護但未登入時的回調函數
   * 如果提供了此函數，則會呼叫此函數而不是執行預設的重定向行為
   * @param currentPath 當前路徑（包含 query string）
   */
  onAuthRequired?: (currentPath: string) => void;

  /**
   * Onboarding 頁面路徑（用於臨時用戶跳轉）
   * 當用戶是臨時用戶時，會自動跳轉到此路徑
   * 例如："/auth/onboarding"
   */
  onboardingPath?: string;

  /**
   * 當偵測到臨時用戶時的回調函數
   * 如果提供了此函數，則會呼叫此函數而不是使用 onboardingPath 跳轉
   * @param currentPath 當前路徑（包含 query string）
   */
  onTemporaryUser?: (currentPath: string) => void;

  /**
   * Email 驗證頁面路徑（用於未驗證 email 的用戶跳轉）
   * 當用戶未驗證 email 時，會自動跳轉到此路徑
   * 例如："/auth/verify-email"
   */
  emailVerificationPath?: string;

  /**
   * 當偵測到未驗證 email 的用戶時的回調函數
   * 如果提供了此函數，則會呼叫此函數而不是使用 emailVerificationPath 跳轉
   * @param currentPath 當前路徑（包含 query string）
   */
  onEmailUnverified?: (currentPath: string) => void;
}

interface AuthProviderProps {
  children: React.ReactNode;
  publicPattern?: PathPattern;
  protectedPattern?: PathPattern;
  defaultProtected?: boolean;
  enableRouteProtection?: boolean;
  onAuthRequired?: (currentPath: string) => void;
  onboardingPath?: string;
  onTemporaryUser?: (currentPath: string) => void;
  emailVerificationPath?: string;
  onEmailUnverified?: (currentPath: string) => void;
}

/**
 * 檢查路徑是否匹配給定的正則表達式字串
 */
const matchesPath = (pathname: string, pattern: string): boolean => {
  try {
    const regex = new RegExp(pattern);
    return regex.test(pathname);
  } catch (error) {
    // 如果正則表達式無效，記錄錯誤並返回 false
    console.error(`Invalid regex pattern: ${pattern}`, error);
    return false;
  }
};

/**
 * 移除 pathname 中的 locale 前綴
 */
const removeLocalePrefix = (pathname: string): string => {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) {
    return pathname;
  }

  const firstSegment = segments[0];
  // 檢查是否是有效的 locale
  if (firstSegment && routing.locales.includes(firstSegment as (typeof routing.locales)[number])) {
    const remainingPath = segments.slice(1).join("/");
    return remainingPath ? `/${remainingPath}` : "/";
  }

  return pathname;
};

/**
 * 將路徑模式標準化為陣列
 */
const normalizePathPattern = (pattern: PathPattern | undefined): string[] => {
  if (!pattern) {
    return [];
  }
  if (typeof pattern === "string") {
    return [pattern];
  }
  return pattern;
};

/**
 * 檢查路徑是否需要保護
 */
const isProtectedPath = (
  pathname: string,
  config: Pick<AuthProviderRouteConfig, "publicPattern" | "protectedPattern" | "defaultProtected">
): boolean => {
  // 移除 locale 前綴以便匹配
  const pathnameWithoutLocale = removeLocalePrefix(pathname);

  // 將路徑模式標準化為陣列
  const publicPatterns = normalizePathPattern(config.publicPattern);
  const protectedPatterns = normalizePathPattern(config.protectedPattern);

  // 檢查是否為公開路徑（優先級最高）
  if (publicPatterns.some((pattern) => matchesPath(pathnameWithoutLocale, pattern))) {
    return false;
  }

  // 如果指定了 protectedPattern，只保護這些路徑
  if (protectedPatterns.length > 0) {
    return protectedPatterns.some((pattern) => matchesPath(pathnameWithoutLocale, pattern));
  }

  // 根據 defaultProtected 設定決定是否保護所有路徑
  return config.defaultProtected !== false;
};

/**
 * Auth Provider 組件
 * 提供全域認證狀態管理和路由保護
 */
export const AuthProvider = ({
  children,
  publicPattern,
  protectedPattern,
  defaultProtected = false,
  enableRouteProtection = true,
  onAuthRequired,
  onboardingPath,
  onTemporaryUser,
  emailVerificationPath,
  onEmailUnverified,
}: AuthProviderProps) => {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTemporary, setIsTemporary] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(true); // 預設為 true，避免閃爍
  const [roles, setRoles] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [loginDialogRedirectUrl, setLoginDialogRedirectUrl] = useState<string | undefined>();
  const [loginDialogSource, setLoginDialogSource] = useState<"website" | "app" | undefined>();
  const [loginDialogDismissible, setLoginDialogDismissible] = useState(true);
  const userInfoStorage = useMemo(() => getStorage<StoredUser>(StorageEnum.UserInfo), []);
  const pathname = usePathname();

  /**
   * 清除認證狀態
   * 統一處理使用者狀態清除邏輯
   */
  const clearAuthState = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    userInfoStorage.remove();

    // 清除可能的認證相關 cookies（僅限非 HttpOnly）
    if (typeof document !== "undefined") {
      const cookiesToClear = ["access_token", "refresh_token", "session", "auth_token"];
      cookiesToClear.forEach((name) => {
        // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API 瀏覽器支援度不足，使用傳統方式清除 cookie
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
    }
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
   * 使用 /api/v1/auth/me 端點獲取當前用戶資訊（支援臨時用戶）
   */
  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getAuthMe();

      if (response.data?.data?.user) {
        const userData = response.data.data.user;
        const temporary = response.data.data.isTemporary ?? false;
        const emailVerified = userData.email_verified ?? false;

        setIsTemporary(temporary);
        setIsEmailVerified(emailVerified);

        const userRoles = userData.roles ?? [];
        const userPermissions = userData.permissions ?? [];
        setRoles(userRoles);
        setPermissions(userPermissions);

        // 即使是臨時用戶也要設置基本的認證狀態
        const storedUser: StoredUser = {
          id: userData.id,
          customId: null,
          email: userData.email ?? null,
          name: userData.name ?? null,
          photoUrl: userData.photo_url ?? null,
          roles: userRoles,
          permissions: userPermissions,
        };
        setAuthState(storedUser);
      } else {
        // 未登入或 Token 無效
        clearAuthState();
        setIsTemporary(false);
        setIsEmailVerified(true); // 重置為 true
        setRoles([]);
        setPermissions([]);
      }
    } catch (error) {
      console.error("Failed to check auth status:", error);
      clearAuthState();
      setIsTemporary(false);
      setIsEmailVerified(true); // 重置為 true
      setRoles([]);
      setPermissions([]);
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
        return true;
      }
      return false;
    } catch (_error) {
      return false;
    }
  }, []);

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
      setRoles(cachedUser.roles ?? []);
      setPermissions(cachedUser.permissions ?? []);
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
          setRoles(newUserInfo.roles ?? []);
          setPermissions(newUserInfo.permissions ?? []);
        } else {
          clearAuthState();
          setRoles([]);
          setPermissions([]);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [userInfoStorage, clearAuthState]);

  /**
   * 路由保護：檢查當前路徑是否需要登入
   * 如果未登入且路徑需要保護，重定向到登入頁面
   */
  useEffect(() => {
    // 如果禁用路由保護，直接返回
    if (!enableRouteProtection) {
      return;
    }

    // 如果還在載入中，不進行檢查
    if (isLoading) {
      return;
    }

    // 如果已登入，不需要檢查
    if (isAuthenticated) {
      return;
    }

    // 檢查當前路徑是否需要保護
    const needsProtection = isProtectedPath(pathname, {
      publicPattern: publicPattern,
      protectedPattern: protectedPattern,
      defaultProtected: defaultProtected,
    });

    if (needsProtection) {
      // 需要保護但未登入
      const currentUrl = pathname + (typeof window !== "undefined" ? window.location.search : "");

      onAuthRequired?.(currentUrl);
    }
  }, [
    pathname,
    isAuthenticated,
    isLoading,
    publicPattern,
    protectedPattern,
    defaultProtected,
    enableRouteProtection,
    onAuthRequired,
  ]);

  /**
   * 臨時用戶處理：如果用戶是臨時用戶，跳轉到 onboarding 頁面
   */
  useEffect(() => {
    // 如果還在載入中，不進行檢查
    if (isLoading) {
      return;
    }

    // 只處理已登入的臨時用戶
    if (!isAuthenticated || !isTemporary) {
      return;
    }

    // 移除 locale 前綴後檢查是否已在 onboarding 頁面
    const pathnameWithoutLocale = removeLocalePrefix(pathname);
    const isOnOnboardingPage = onboardingPath
      ? pathnameWithoutLocale.startsWith(onboardingPath)
      : false;

    // 如果已在 onboarding 頁面，不需要跳轉
    if (isOnOnboardingPage) {
      return;
    }

    const currentUrl = pathname + (typeof window !== "undefined" ? window.location.search : "");

    // 優先使用 onTemporaryUser 回調
    if (onTemporaryUser) {
      onTemporaryUser(currentUrl);
    } else if (onboardingPath && typeof window !== "undefined") {
      // 否則跳轉到 onboardingPath
      window.location.href = onboardingPath;
    }
  }, [pathname, isAuthenticated, isLoading, isTemporary, onboardingPath, onTemporaryUser]);

  /**
   * Email 未驗證處理：如果用戶未驗證 email，跳轉到驗證頁面
   * 注意：這個 effect 只在用戶不是臨時用戶時才執行（臨時用戶優先處理 onboarding）
   */
  useEffect(() => {
    // 如果還在載入中，不進行檢查
    if (isLoading) {
      return;
    }

    // 只處理已登入、非臨時用戶、且未驗證 email 的用戶
    if (!isAuthenticated || isTemporary || isEmailVerified) {
      return;
    }

    // 移除 locale 前綴後檢查路徑
    const pathnameWithoutLocale = removeLocalePrefix(pathname);

    // 如果在 email 驗證頁面，不需要跳轉
    const isOnVerificationPage = emailVerificationPath
      ? pathnameWithoutLocale.startsWith(emailVerificationPath)
      : false;
    if (isOnVerificationPage) {
      return;
    }

    // 如果在 onboarding 頁面，不需要跳轉（讓用戶看完 Success 頁面）
    const isOnOnboardingPage = onboardingPath
      ? pathnameWithoutLocale.startsWith(onboardingPath)
      : false;
    if (isOnOnboardingPage) {
      return;
    }

    const currentUrl = pathname + (typeof window !== "undefined" ? window.location.search : "");

    // 優先使用 onEmailUnverified 回調
    if (onEmailUnverified) {
      onEmailUnverified(currentUrl);
    } else if (emailVerificationPath && typeof window !== "undefined") {
      // 否則跳轉到 emailVerificationPath
      window.location.href = emailVerificationPath;
    }
  }, [
    pathname,
    isAuthenticated,
    isLoading,
    isTemporary,
    isEmailVerified,
    onboardingPath,
    emailVerificationPath,
    onEmailUnverified,
  ]);

  /**
   * 開啟登入 Dialog
   */
  const openLoginDialog = useCallback(
    (options?: { redirectUrl?: string; source?: "website" | "app"; dismissible?: boolean }) => {
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
      if (options?.dismissible !== undefined) {
        setLoginDialogDismissible(options.dismissible);
      } else {
        setLoginDialogDismissible(true);
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

  const hasRole = useCallback((role: string) => roles.includes(role), [roles]);
  const hasPermission = useCallback(
    (permission: string) => permissions.includes(permission),
    [permissions]
  );
  const isAdmin = useMemo(
    () => roles.some((r) => r.toLowerCase().includes("admin")),
    [roles]
  );

  const value: AuthContextValue = useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      isTemporary,
      isEmailVerified,
      login,
      logout,
      refreshToken,
      openLoginDialog,
      requireAuth,
      refreshAuth: checkAuth,
      roles,
      permissions,
      hasRole,
      hasPermission,
      isAdmin,
    }),
    [
      user,
      isAuthenticated,
      isLoading,
      isTemporary,
      isEmailVerified,
      login,
      logout,
      refreshToken,
      openLoginDialog,
      requireAuth,
      checkAuth,
      roles,
      permissions,
      hasRole,
      hasPermission,
      isAdmin,
    ]
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
        dismissible={loginDialogDismissible}
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
