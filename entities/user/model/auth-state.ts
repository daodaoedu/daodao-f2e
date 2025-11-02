import { getTokenStorage } from '@/shared/lib/storage';
import {
  UserValidatorsCreateUserSchema,
  UserValidatorsUpdateUserSchema,
} from '@/generated/models';
import { AuthActions, AuthLoginStatus, AuthState } from './auth-types';

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

export const isTemporaryLogin = (
  loginStatus: AuthLoginStatus,
  input: Parameters<AuthActions['updateUser']>[0]
): input is UserValidatorsCreateUserSchema => {
  return loginStatus === AuthLoginStatus.TEMPORARY;
};

export const isPermanentLogin = (
  loginStatus: AuthLoginStatus,
  input: Parameters<AuthActions['updateUser']>[0]
): input is UserValidatorsUpdateUserSchema => {
  return loginStatus === AuthLoginStatus.PERMANENT;
};
