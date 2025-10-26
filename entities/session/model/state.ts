import { getTokenStorage } from '@/shared/lib/storage';
import {
  UserValidatorsCreateUserSchema,
  UserValidatorsUpdateUserSchema,
} from '@/generated/models';
import { SessionActions, SessionLoginStatus, SessionState } from './types';

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

export const isTemporaryLogin = (
  loginStatus: SessionLoginStatus,
  input: Parameters<SessionActions['updateUser']>[0]
): input is UserValidatorsCreateUserSchema => {
  return loginStatus === SessionLoginStatus.TEMPORARY;
};

export const isPermanentLogin = (
  loginStatus: SessionLoginStatus,
  input: Parameters<SessionActions['updateUser']>[0]
): input is UserValidatorsUpdateUserSchema => {
  return loginStatus === SessionLoginStatus.PERMANENT;
};
