"use client";

import { useCurrentUser } from "@daodao/api";
import { useAuth } from "@daodao/auth";
import { type PropsWithChildren, useEffect, useState } from "react";
import { useRouter } from "@/shared/i18n/navigation";
import { Button } from "@/shared/ui/button";
import { IslandPlaceholder } from "@/shared/ui/island-placeholder";
import type { UserProfile } from "../model";

enum AuthorizationStatus {
  IDLE = "IDLE",
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
}

const defaultFullscreen = <div className="h-screen w-screen bg-white" />;

export interface ProtectedComponentProps extends PropsWithChildren {
  /**
   * 是否只檢查 token
   */
  onlyCheckToken?: boolean;
  /**
   * 未登入時顯示的 fallback 元件
   */
  fallback?: React.ReactNode;
  /**
   * 沒有權限時顯示的 fallback 元件
   */
  noPermissionFallback?: React.ReactNode;
  /**
   * 確認登入中顯示的 skeleton 元件
   */
  skeleton?: React.ReactNode;
  /**
   * 登入後驗證使用者權限的函數
   * @param user 使用者物件
   * @returns 回傳一個 Promise，解析為 boolean 值
   */
  checkUserAuthorized?: (user: UserProfile) => boolean | Promise<boolean>;
}

/**
 * 保護元件
 * 用於保護頁面不被未授權的用戶訪問
 * 可以選擇只檢查 token 或檢查是否已登錄
 * 預設為一個全螢幕的白色區塊
 */
export function ProtectedComponent({
  children,
  onlyCheckToken = false,
  fallback,
  noPermissionFallback,
  skeleton = defaultFullscreen,
  checkUserAuthorized,
}: ProtectedComponentProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, openLoginDialog } = useAuth();
  const { data: currentUserResponse, isLoading: userLoading } = useCurrentUser();
  // useCurrentUser 返回: { data: { success: true, data: FormattedUserResponse, timestamp: string } }
  // FormattedUserResponse 就是 UserProfile 的結構
  const fullUser = currentUserResponse?.data as UserProfile | undefined;
  const isLoading = authLoading || userLoading;
  const requiresLogin = onlyCheckToken ? !isAuthenticated : !isAuthenticated;
  const [authorizationState, setAuthorizationState] = useState<AuthorizationStatus>(
    AuthorizationStatus.IDLE
  );

  const isCheckingAuthorization =
    checkUserAuthorized &&
    [AuthorizationStatus.IDLE, AuthorizationStatus.PENDING].includes(authorizationState);

  const isShowSkeleton = isCheckingAuthorization || isLoading;

  useEffect(() => {
    if (!checkUserAuthorized) {
      return;
    }

    if (isAuthenticated && fullUser && authorizationState === AuthorizationStatus.IDLE) {
      setAuthorizationState(AuthorizationStatus.PENDING);
      Promise.resolve(checkUserAuthorized(fullUser))
        .then((isAllowed) => {
          setAuthorizationState(
            isAllowed ? AuthorizationStatus.SUCCESS : AuthorizationStatus.ERROR
          );
        })
        .catch(() => {
          setAuthorizationState(AuthorizationStatus.ERROR);
        });
    }

    if (!isAuthenticated && authorizationState !== AuthorizationStatus.IDLE) {
      setAuthorizationState(AuthorizationStatus.IDLE);
    }
  }, [isAuthenticated, fullUser, checkUserAuthorized, authorizationState]);

  if (isShowSkeleton) {
    return skeleton;
  }

  if (authorizationState === AuthorizationStatus.ERROR) {
    return (
      noPermissionFallback ?? (
        <IslandPlaceholder title="沒有權限">
          <div className="flex items-center justify-center gap-4">
            <Button onClick={() => router.back()} variant="outline" size="lg" className="w-32">
              返回
            </Button>
            <Button
              onClick={() => router.push(isAuthenticated ? "/explore" : "/")}
              size="lg"
              className="w-32"
            >
              首頁
            </Button>
          </div>
        </IslandPlaceholder>
      )
    );
  }

  if (requiresLogin) {
    return (
      fallback ?? (
        <IslandPlaceholder title="登入後即可使用完整功能">
          <div className="flex items-center justify-center gap-4">
            <Button onClick={() => router.push("/")} variant="outline" size="lg" className="w-32">
              回首頁
            </Button>
            <Button onClick={() => openLoginDialog()} size="lg" className="w-32">
              登入 / 註冊
            </Button>
          </div>
        </IslandPlaceholder>
      )
    );
  }

  return children;
}
