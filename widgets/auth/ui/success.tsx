'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionActions } from '@/features/auth';
import { IslandPlaceholder } from '@/shared/ui/island-placeholder';
import { parseToString } from '@/shared/lib/helper';
import { formatJWTInfo } from '@/shared/lib/jwt';

export const AuthSuccess = () => {
  const { setToken } = useSessionActions();
  const router = useRouter();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const token = parseToString(searchParams.get('token'));
    const rt = parseToString(searchParams.get('rt'));
    const redirectTo = rt?.startsWith('/') ? rt : '/';
    const isTemp = token && !formatJWTInfo(token).payload?.isTemp;

    if (token) setToken(token);

    router.replace(isTemp ? `/onboarding?rt=${redirectTo}` : redirectTo);
  }, [setToken, router]);

  return <IslandPlaceholder title="正在前往新的島嶼" />;
};
