import {
  checkIsDevHost,
  getBackendUrl,
  getFrontendUrl,
  LOGIN_TYPE,
} from '@/utils/env';
import { getDevOriginStorage, getTokenStorage } from '@/utils/storage';

export const sendLoginEvent = (token: string) => {
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
      const isDevHost = checkIsDevHost();
      const origin = getDevOriginStorage().get();

      if (isDevHost && origin) {
        getDevOriginStorage().remove();
        window.location.href = `${origin}/auth/google?token=${token}`;
      }
      return true;
    }
    throw e;
  }
};

export const redirectToAuth = () => {
  const isDevHost = checkIsDevHost();
  const frontendUrl = getFrontendUrl();
  const backendUrl = getBackendUrl();
  const currentUrl = window.location.origin;

  if (isDevHost && frontendUrl !== currentUrl) {
    window.location.href = `${frontendUrl}/auth/google?origin=${currentUrl}`;
  } else if (frontendUrl === currentUrl) {
    const searchParams = new URLSearchParams(window.location.search);
    getDevOriginStorage().set(searchParams.get('origin'));
    window.location.href = `${backendUrl}/auth/google`;
  }
};
