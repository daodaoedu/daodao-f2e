import { getTokenStorage } from '@/shared/lib/storage';
import { SessionLoginStatus, SessionState } from './types';

export const createInitialSessionState = (): SessionState => {
  const token = getTokenStorage().get() ?? null;
  return {
    isComplete: false,
    isLoggedIn: false,
    isLoggingIn: true,
    isTemporary: false,
    isOpenLoginModal: false,
    loginStatus: SessionLoginStatus.EMPTY,
    user: null,
    token,
  };
};

export const initialSessionState = createInitialSessionState();
