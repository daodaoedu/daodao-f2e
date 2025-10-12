'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthDispatch } from '@/features/auth';
import { IslandPlaceholder } from '@/shared/ui/island-placeholder';
import { parseToString } from '@/utils/helper';

export const AuthOnboarding = () => {
  const { setToken } = useAuthDispatch();
  const router = useRouter();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const token = parseToString(searchParams.get('token'));
    const rt = parseToString(searchParams.get('rt'));

    if (token) setToken(token);
    router.replace(rt?.startsWith('/') ? rt : '/');
  }, [setToken, router]);

  return <IslandPlaceholder title="正在前往新的島嶼" />;
};
