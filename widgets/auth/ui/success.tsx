'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionActions } from '@/entities/session';
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
    const needsOnboarding = token
      ? formatJWTInfo(token).payload?.isTemp
      : false;

    const getQueryString = (query: URLSearchParams) =>
      query.size ? `?${query.toString()}` : '';

    searchParams.delete('token');

    if (token) setToken(token);

    if (needsOnboarding) {
      router.replace(`/onboarding${getQueryString(searchParams)}`);
    } else {
      searchParams.delete('rt');
      router.replace(`${redirectTo}${getQueryString(searchParams)}`);
    }
  }, [setToken, router]);

  return <IslandPlaceholder title="正在前往新的島嶼" />;
};
