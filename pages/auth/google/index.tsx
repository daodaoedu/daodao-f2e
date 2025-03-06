import { useLayoutEffect } from 'react';
import { checkIsDevHost, getBackendUrl } from '@/utils/env';
import { getDevOriginStorage } from '@/utils/storage';

function AuthCallbackPage() {
  useLayoutEffect(() => {
    if (checkIsDevHost()) {
      getDevOriginStorage().set(window.location.origin);
    }
    window.location.href = `${getBackendUrl()}/auth/google`;
  }, []);

  return null;
}

AuthCallbackPage.getLayout = (page: React.ReactNode) => page;

export default AuthCallbackPage;
