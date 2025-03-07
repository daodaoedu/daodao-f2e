import { useRouter } from 'next/router';
import { PropsWithChildren, useEffect, useRef } from 'react';
import { useAuth, useAuthDispatch } from './AuthContext';

interface ProtectedComponentProps extends PropsWithChildren {
  redirectOnCancel?: string;
  onlyCheckToken?: boolean;
}

export default function ProtectedComponent({
  children,
  redirectOnCancel,
  onlyCheckToken = false,
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
    opened.current,
    requiresLogin,
    token,
    router.replace,
  ]);

  if (requiresLogin) return <div className="h-screen w-screen" />;

  return children;
}
