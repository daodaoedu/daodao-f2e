'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthDispatch } from '@/features/auth';
import {
  getDevOriginStorage,
  getRedirectionStorage,
  getTokenStorage,
} from '@/utils/storage';
import { Image } from '@/shared/ui/image';
import { parseToString } from '@/utils/helper';
import getEnv, { LOGIN_TYPE } from '@/utils/env';

const sendLoginEvent = async (token: string) => {
  getTokenStorage().remove();

  try {
    if (
      window.opener &&
      window.opener.location.origin === window.location.origin
    ) {
      window.opener.postMessage(
        { type: LOGIN_TYPE, payload: { token } },
        window.location.origin
      );
      window.close();
      return true;
    }

    return false;
  } catch (e) {
    if (e instanceof DOMException) {
      // 非同源政策會拋出錯誤，只有開發分支與本地開發會有此情況
      const { isLocalOrPreviewHost: isDevHost } = getEnv();
      const origin = getDevOriginStorage().get();

      if (isDevHost && origin) {
        getDevOriginStorage().remove();
        window.location.href = `${origin}/auth/callback?token=${token}`;
      }
      return true;
    }
    throw e;
  }
};

export const AuthCallback = () => {
  const { setToken } = useAuthDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = parseToString(searchParams?.get('token'));
  const isVerified = parseToString(searchParams?.get('isVerified'));

  useEffect(() => {
    if (!token) return;

    sendLoginEvent(token).then((isSendOpener) => {
      const redirectPathname = getRedirectionStorage().get();
      getRedirectionStorage().remove();
      if (isSendOpener) return;
      setToken(token);
      router.replace(redirectPathname ?? '/');
    });
  }, [token, isVerified, setToken, router]);

  return (
    <div className="mx-auto my-5 min-h-[60vh] w-11/12 rounded-lg border border-solid border-basic-100 p-5 shadow-lg">
      <h2 className="text-center text-3xl font-bold tracking-[0.08em] text-basic-400">
        正在前往新的島嶼
      </h2>
      <div className="flex items-center justify-center">
        <Image
          src="/assets/images/nobody-island.gif"
          alt="nobody-land"
          width={300}
          height={300}
        />
      </div>
    </div>
  );
};
