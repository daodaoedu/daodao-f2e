'use client';

import { useLayoutEffect } from 'react';
import { getDevOriginStorage } from '@/utils/storage';
import getEnv from '@/utils/env';

export const GoogleAuthRedirect = () => {
  useLayoutEffect(() => {
    const { isLocalOrPreviewHost, stagingHostname, apiUrl } = getEnv();
    const currentUrl = window.location.origin;

    if (isLocalOrPreviewHost) {
      window.location.href = `${stagingHostname}/auth/google?origin=${currentUrl}`;
    } else {
      const searchParams = new URLSearchParams(window.location.search);
      getDevOriginStorage().set(searchParams.get('origin'));
      window.location.href = `${apiUrl}/api/v1/auth/google`;
    }
  }, []);

  return null;
};
