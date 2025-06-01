import getEnv, { LOGIN_TYPE } from '@/utils/env';
import { getDevOriginStorage, getTokenStorage } from '@/utils/storage';
import { LoginMessageEvent, LoginStatus } from './type';

/**
 * 發送登入事件
 * @param token 登入 token
 * @returns 是否發送登入事件到 opener 頁面
 */
export const sendLoginEvent = async (token: string) => {
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
      const { isDevHost } = getEnv();
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

/**
 * 註冊登入事件
 * @param loginStatus 登入狀態
 * @param callback 登入事件回調
 * @returns 註銷登入事件
 */
export const registerLoginListener = (
  loginStatus: LoginStatus,
  callback: (token: string) => void
) => {
  const receiveMessage = (event: LoginMessageEvent) => {
    if (event.origin !== window.location.origin) {
      return;
    }
    if (event.data.type === LOGIN_TYPE) {
      const { token } = event.data.payload;

      if (token) callback(token);
    }
  };

  const unregisterLoginListener = () => {
    window.removeEventListener('message', receiveMessage, false);
  };

  const token = getTokenStorage().get();

  if (token) callback(token);

  if (loginStatus === LoginStatus.PERMANENT) {
    unregisterLoginListener();
  } else {
    window.addEventListener('message', receiveMessage, false);
  }

  return unregisterLoginListener;
};

/**
 * 主要是針對開發環境使用的，重定向到登入頁面
 */
export const redirectToAuth = () => {
  const { isDevHost, frontendUrl, apiUrl } = getEnv();
  const currentUrl = window.location.origin;

  if (isDevHost && frontendUrl !== currentUrl) {
    window.location.href = `${frontendUrl}/auth/google?origin=${currentUrl}`;
  } else if (frontendUrl === currentUrl) {
    const searchParams = new URLSearchParams(window.location.search);
    getDevOriginStorage().set(searchParams.get('origin'));
    window.location.href = `${apiUrl}/auth/google`;
  }
};
