import type {
  CreateUserFormSchema,
  UpdateUserFormSchema,
  UserSchema,
} from '@/services/users';
import { LOGIN_TYPE } from '@/utils/env';

export enum LoginStatus {
  /** 未登入 */
  EMPTY,
  /** 臨時登入 */
  TEMPORARY,
  /** 正式登入 */
  PERMANENT,
}

export type Callbacks = {
  successCallback?: () => void;
  registerCallback?: (callback: () => void) => void;
};

interface CommonAuthState {
  isComplete: boolean;
  isLoggingIn: boolean;
  isOpenLoginModal: boolean;
  token: string | null;
}

interface EmptyLoginState extends CommonAuthState {
  isLoggedIn: false;
  isTemporary: false;
  loginStatus: LoginStatus.EMPTY;
  user: null;
}

interface TemporaryLoginState extends CommonAuthState {
  isLoggedIn: false;
  isTemporary: true;
  loginStatus: LoginStatus.TEMPORARY;
  user: null;
}

interface PermanentLoginState extends CommonAuthState {
  isLoggedIn: true;
  isTemporary: false;
  loginStatus: LoginStatus.PERMANENT;
  user: UserSchema;
}

export type AuthState =
  | EmptyLoginState
  | TemporaryLoginState
  | PermanentLoginState;

export enum ActionTypes {
  OPEN_LOGIN_MODAL = 'openLoginModal',
  CLOSE_LOGIN_MODAL = 'closeLoginModal',
  SET_TOKEN = 'setToken',
  SET_LOADING = 'setLoading',
  UPDATE_USER = 'updateUser',
  LOGIN = 'login',
  LOGOUT = 'logout',
}

export type Action =
  | { type: ActionTypes.OPEN_LOGIN_MODAL }
  | { type: ActionTypes.CLOSE_LOGIN_MODAL }
  | { type: ActionTypes.SET_TOKEN; payload: string }
  | { type: ActionTypes.SET_LOADING; payload: boolean }
  | { type: ActionTypes.UPDATE_USER; payload: UserSchema }
  | { type: ActionTypes.LOGIN; payload: UserSchema | null }
  | { type: ActionTypes.LOGOUT };

export type AuthDispatch = {
  [ActionTypes.OPEN_LOGIN_MODAL]: (payload?: Callbacks) => void;
  [ActionTypes.CLOSE_LOGIN_MODAL]: () => void;
  [ActionTypes.SET_TOKEN]: (payload: string) => void;
  [ActionTypes.SET_LOADING]: (payload: boolean) => void;
  [ActionTypes.UPDATE_USER]: (
    payload: CreateUserFormSchema | UpdateUserFormSchema
  ) => Promise<void>;
  [ActionTypes.LOGIN]: (payload: UserSchema | null) => void;
  [ActionTypes.LOGOUT]: () => void;
};

export type LoginMessageEvent = MessageEvent<{
  type: typeof LOGIN_TYPE;
  payload: { token: string };
}>;
