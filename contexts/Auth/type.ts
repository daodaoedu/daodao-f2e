import type {
  CreateUserRequest,
  UpdateUserRequest,
  IUser,
} from "@/services/users";

export enum LoginStatus {
  /** 未登入 */
  EMPTY,
  /** 臨時登入 */
  TEMPORARY,
  /** 正式登入 */
  PERMANENT,
}

interface CommonAuthState {
  isComplete: boolean;
  isOpenLoginModal: boolean;
  token: string | null;
  redirectUrl: string;
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
  user: IUser;
}

export type AuthState =
  | EmptyLoginState
  | TemporaryLoginState
  | PermanentLoginState;

export enum ActionTypes {
  OPEN_LOGIN_MODAL = "openLoginModal",
  CLOSE_LOGIN_MODAL = "closeLoginModal",
  SET_TOKEN = "setToken",
  UPDATE_USER = "updateUser",
  LOGIN = "login",
  LOGOUT = "logout",
}

export type Action =
  | { type: ActionTypes.OPEN_LOGIN_MODAL; payload?: string }
  | { type: ActionTypes.CLOSE_LOGIN_MODAL }
  | { type: ActionTypes.SET_TOKEN; payload: string }
  | { type: ActionTypes.UPDATE_USER; payload: IUser }
  | { type: ActionTypes.LOGIN; payload: IUser | null }
  | { type: ActionTypes.LOGOUT };

export type AuthDispatch = {
  [ActionTypes.OPEN_LOGIN_MODAL]: (redirectUrl?: string) => void;
  [ActionTypes.CLOSE_LOGIN_MODAL]: () => void;
  [ActionTypes.SET_TOKEN]: (payload: string) => void;
  [ActionTypes.UPDATE_USER]: (
    payload: CreateUserRequest | UpdateUserRequest
  ) => Promise<void>;
  [ActionTypes.LOGIN]: (payload: IUser | null) => void;
  [ActionTypes.LOGOUT]: () => void;
};
