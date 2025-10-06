'use client';

import { useRouter } from 'next/navigation';
import { PropsWithChildren, useEffect, useState } from 'react';
import { UserValidatorsUserSuccessResponseSchemaData } from '@/generated/models';
import { Background, Container, Paper } from '@/shared/ui/wrapper';
import { Image } from '@/shared/ui/image';
import { Button } from '@/shared/ui/button';
import SEOConfig from '@/components/SEOConfig';
import { useAuth, useAuthDispatch } from './AuthContext';

enum AuthorizationStatus {
  IDLE = 'IDLE',
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

interface FallbackProps {
  title: string;
  children: React.ReactNode;
}

export const Fallback = ({ title, children }: FallbackProps) => (
  <Background className="min-h-screen">
    <SEOConfig title={`${title} | 島島阿學`} />
    <Container className="pb-5">
      <Paper>
        <h2 className="text-center text-3xl font-bold tracking-[0.08em] text-basic-400">
          {title}
        </h2>
        <div className="flex items-center justify-center">
          <Image
            src="/assets/images/nobody-island.gif"
            alt="nobody-land"
            width={300}
            height={300}
          />
        </div>
        {children}
      </Paper>
    </Container>
  </Background>
);

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
  checkUserAuthorized?: (user: UserValidatorsUserSuccessResponseSchemaData) => boolean | Promise<boolean>;
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
  const {
    user, isLoggedIn, token, isLoggingIn,
  } = useAuth();
  const { openLoginModal } = useAuthDispatch();
  const requiresLogin = onlyCheckToken ? !token : !isLoggedIn;
  const [authorizationState, setAuthorizationState] = useState<AuthorizationStatus>(AuthorizationStatus.IDLE);

  useEffect(() => {
    if (!checkUserAuthorized) {
      return;
    }

    if (isLoggedIn && user && authorizationState === AuthorizationStatus.IDLE) {
      setAuthorizationState(AuthorizationStatus.PENDING);
      Promise.resolve(checkUserAuthorized(user))
        .then((isAllowed) => {
          setAuthorizationState(
            isAllowed ? AuthorizationStatus.SUCCESS : AuthorizationStatus.ERROR
          );
        })
        .catch(() => {
          setAuthorizationState(AuthorizationStatus.ERROR);
        });
    }

    if (!isLoggedIn && authorizationState !== AuthorizationStatus.IDLE) {
      setAuthorizationState(AuthorizationStatus.IDLE);
    }
  }, [isLoggedIn, user, checkUserAuthorized, authorizationState]);

  if (isLoggingIn) {
    return skeleton;
  }

  if (requiresLogin) {
    return (
      fallback ?? (
        <Fallback title="登入後即可使用完整功能">
          <div className="flex items-center justify-center gap-4">
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
        </Fallback>
      )
    );
  }

  if (checkUserAuthorized) {
    if (
      authorizationState === AuthorizationStatus.IDLE ||
      authorizationState === AuthorizationStatus.PENDING
    ) {
      return skeleton;
    }

    if (authorizationState === AuthorizationStatus.ERROR) {
      return (
        noPermissionFallback ?? (
          <Fallback title="沒有權限">
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={() => router.back()}
                variant="outline"
                size="lg"
                className="w-32"
              >
                返回
              </Button>
              <Button
                onClick={() => router.push('/')}
                size="lg"
                className="w-32"
              >
                首頁
              </Button>
            </div>
          </Fallback>
        )
      );
    }
  }

  return children;
}
