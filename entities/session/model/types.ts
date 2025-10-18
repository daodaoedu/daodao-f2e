import {
  UserValidatorsCreateUserResponseSchemaDataUser,
  UserValidatorsCreateUserSchema,
  UserValidatorsGetUserParamsSchema,
  UserValidatorsUserSuccessResponseSchemaData,
} from '@/generated/models';

export enum SessionLoginStatus {
  /** 未登入 */
  EMPTY,
  /** 臨時登入 */
  TEMPORARY,
  /** 正式登入 */
  PERMANENT,
}

interface CommonLoginState {
  isComplete: boolean;
  isLoggingIn: boolean;
  isOpenLoginModal: boolean;
  token: string | null;
}

interface EmptyLoginState extends CommonLoginState {
  isLoggedIn: false;
  isTemporary: false;
  loginStatus: SessionLoginStatus.EMPTY;
  user: null;
}

interface TemporaryLoginState extends CommonLoginState {
  isLoggedIn: false;
  isTemporary: true;
  loginStatus: SessionLoginStatus.TEMPORARY;
  user: null;
}

interface PermanentLoginState extends CommonLoginState {
  isLoggedIn: true;
  isTemporary: false;
  loginStatus: SessionLoginStatus.PERMANENT;
  user: UserValidatorsCreateUserResponseSchemaDataUser;
}

export type SessionState =
  | EmptyLoginState
  | TemporaryLoginState
  | PermanentLoginState;

export enum SessionActionTypes {
  OPEN_LOGIN_MODAL = 'openLoginModal',
  CLOSE_LOGIN_MODAL = 'closeLoginModal',
  SET_TOKEN = 'setToken',
  SET_LOADING = 'setLoading',
  UPDATE_USER = 'updateUser',
  LOGIN = 'login',
  LOGOUT = 'logout',
}

export type SessionAction =
  | { type: SessionActionTypes.OPEN_LOGIN_MODAL }
  | { type: SessionActionTypes.CLOSE_LOGIN_MODAL }
  | { type: SessionActionTypes.SET_TOKEN; payload: string }
  | { type: SessionActionTypes.SET_LOADING; payload: boolean }
  | {
      type: SessionActionTypes.UPDATE_USER;
      payload: UserValidatorsCreateUserResponseSchemaDataUser;
    }
  | {
      type: SessionActionTypes.LOGIN;
      payload: UserValidatorsUserSuccessResponseSchemaData | null;
    }
  | { type: SessionActionTypes.LOGOUT };

export type SessionActions = {
  [SessionActionTypes.OPEN_LOGIN_MODAL]: () => void;
  [SessionActionTypes.CLOSE_LOGIN_MODAL]: () => void;
  [SessionActionTypes.SET_TOKEN]: (payload: string) => void;
  [SessionActionTypes.SET_LOADING]: (payload: boolean) => void;
  [SessionActionTypes.UPDATE_USER]: (
    payload: UserValidatorsCreateUserSchema | UserValidatorsGetUserParamsSchema
  ) => Promise<void>;
  [SessionActionTypes.LOGIN]: (
    payload: UserValidatorsUserSuccessResponseSchemaData | null
  ) => void;
  [SessionActionTypes.LOGOUT]: () => void;
};
