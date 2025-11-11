import type {
  CreateUserSchema,
  UpdateUserSchema,
  UserProfile,
} from './constants';

export enum AuthLoginStatus {
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
  loginStatus: AuthLoginStatus.EMPTY;
  user: null;
}

interface TemporaryLoginState extends CommonLoginState {
  isLoggedIn: false;
  isTemporary: true;
  loginStatus: AuthLoginStatus.TEMPORARY;
  user: null;
}

interface PermanentLoginState extends CommonLoginState {
  isLoggedIn: true;
  isTemporary: false;
  loginStatus: AuthLoginStatus.PERMANENT;
  user: UserProfile;
}

export type AuthState =
  | EmptyLoginState
  | TemporaryLoginState
  | PermanentLoginState;

export enum AuthActionTypes {
  OPEN_LOGIN_MODAL = 'openLoginModal',
  CLOSE_LOGIN_MODAL = 'closeLoginModal',
  SET_TOKEN = 'setToken',
  SET_LOADING = 'setLoading',
  UPDATE_USER = 'updateUser',
  LOGIN = 'login',
  LOGOUT = 'logout',
}

export type AuthAction =
  | { type: AuthActionTypes.OPEN_LOGIN_MODAL }
  | { type: AuthActionTypes.CLOSE_LOGIN_MODAL }
  | { type: AuthActionTypes.SET_TOKEN; payload: string }
  | { type: AuthActionTypes.SET_LOADING; payload: boolean }
  | {
      type: AuthActionTypes.UPDATE_USER;
      payload: UserProfile;
    }
  | {
      type: AuthActionTypes.LOGIN;
      payload: UserProfile | null;
    }
  | { type: AuthActionTypes.LOGOUT };

export type AuthActions = {
  [AuthActionTypes.OPEN_LOGIN_MODAL]: () => void;
  [AuthActionTypes.CLOSE_LOGIN_MODAL]: () => void;
  [AuthActionTypes.SET_TOKEN]: (payload: string) => void;
  [AuthActionTypes.SET_LOADING]: (payload: boolean) => void;
  [AuthActionTypes.UPDATE_USER]: (
    payload: CreateUserSchema | UpdateUserSchema
  ) => Promise<void>;
  [AuthActionTypes.LOGIN]: (payload: UserProfile | null) => void;
  [AuthActionTypes.LOGOUT]: () => void;
};
