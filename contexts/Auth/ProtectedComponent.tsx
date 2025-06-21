import { useRouter } from "next/router";
import { PropsWithChildren, useEffect, useRef } from "react";
import { Background, Container, Paper } from "@/components/ui/wrapper";
import Image from "@/shared/components/Image";
import { Button } from "@/components/ui/button";
import { useAuth, useAuthDispatch } from "./AuthContext";

const DefaultFallback = () => {
  const router = useRouter();
  const { openLoginModal } = useAuthDispatch();

  return (
    <Background>
      <Container className="pb-5">
        <Paper>
          <h2 className="text-center text-3xl font-bold tracking-[0.08em] text-basic-400">
            登入後即可使用完整功能
          </h2>
          <div className="flex justify-center items-center">
            <Image
              src="/assets/nobody-land.gif"
              alt="nobody-land"
              width="300"
              height="300"
            />
          </div>
          <div className="flex justify-center items-center gap-4">
            <Button
              onClick={() => router.back()}
              variant="outline"
              size="lg"
              className="w-32"
            >
              返回
            </Button>
            <Button onClick={() => openLoginModal()} size="lg" className="w-32">
              登入 / 註冊
            </Button>
          </div>
        </Paper>
      </Container>
    </Background>
  );
};

const defaultFallback = <DefaultFallback />;

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
   * 未登入時顯示的 fallback 元件
   */
  fallback?: React.ReactNode;
}

/**
 * 保護元件
 * 用於保護頁面不被未授權的用戶訪問
 * 可以選擇只檢查 token 或檢查是否已登錄
 * 預設為一個全螢幕的白色區塊
 */
export function ProtectedComponent({
  children,
  redirectOnCancel,
  onlyCheckToken = false,
  fallback = defaultFallback,
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
    return fallback;
  }

  return children;
}
