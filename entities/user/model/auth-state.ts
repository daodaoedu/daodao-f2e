import { getTokenStorage } from '@/shared/lib/storage';
import { AuthLoginStatus, AuthState } from './auth-types';

export const createInitialAuthState = (): AuthState => {
  const token = getTokenStorage().get() ?? null;
  return {
    isComplete: false,
    isLoggedIn: false,
    isLoggingIn: true,
    isTemporary: false,
    isOpenLoginModal: false,
    loginStatus: AuthLoginStatus.EMPTY,
    user: null,
    token,
  };
};

export const initialAuthState = createInitialAuthState();
