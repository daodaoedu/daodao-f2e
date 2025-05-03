import { useRouter } from 'next/router';
import { PropsWithChildren, useEffect, useRef } from 'react';
import { useAuth, useAuthDispatch } from './AuthContext';

const defaultLoadingComponent = (
  <div className="h-screen w-screen bg-basic-white" />
);

export interface ProtectedComponentProps extends PropsWithChildren {
  /**
   * 當需要重定向時的 URL
   */
  redirectOnCancel?: string;
  /**
   * 是否只檢查 token
   */
  onlyCheckToken?: boolean;
  /**
   * 當需要等待時的 fallback 元件
   * 預設為一個全螢幕的白色區塊
   */
  loadingComponent?: React.ReactNode;
}

/**
 * 保護元件
 * 用於保護頁面不被未授權的用戶訪問
 * 可以選擇只檢查 token 或檢查是否已登錄
 * 預設為一個全螢幕的白色區塊
 */
export default function ProtectedComponent({
  children,
  redirectOnCancel,
  onlyCheckToken = false,
  loadingComponent = defaultLoadingComponent,
}: ProtectedComponentProps) {
  const router = useRouter();
  const opened = useRef(false);
  const { isLoggedIn, isOpenLoginModal, token } = useAuth();
  const { openLoginModal } = useAuthDispatch();
  const requiresLogin = onlyCheckToken ? !token : !isLoggedIn;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (requiresLogin && !token) {
      timer = setTimeout(() => {
        opened.current = true;
        openLoginModal();
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [requiresLogin, token, openLoginModal]);

  useEffect(() => {
    if (
      redirectOnCancel &&
      !isOpenLoginModal &&
      opened.current &&
      requiresLogin &&
      !token
    ) {
      router.replace(redirectOnCancel);
    }
  }, [
    redirectOnCancel,
    isOpenLoginModal,
    opened,
    requiresLogin,
    token,
    router.replace,
  ]);

  if (requiresLogin) {
    return loadingComponent;
  }

  return children;
}
