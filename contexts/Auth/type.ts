import type {
  CreateUserProfile,
  UpdateUserProfile,
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

export type AuthState = {
  isComplete: boolean;
  isLoggedIn: boolean;
  isTemporary: boolean;
  isOpenLoginModal: boolean;
  loginStatus: LoginStatus;
  token: string | null;
  user: IUser | null;
  redirectUrl: string;
};

export enum ActionTypes {
  OPEN_LOGIN_MODAL = "openLoginModal",
  CLOSE_LOGIN_MODAL = "closeLoginModal",
  SET_TOKEN = "setToken",
  UPDATE_USER = "updateUser",
  LOGIN = "login",
  LOGOUT = "logout",
}

interface OpenLoginModalPayload {
  redirectUrl?: string;
}

export type Action =
  | { type: ActionTypes.OPEN_LOGIN_MODAL; payload?: OpenLoginModalPayload }
  | { type: ActionTypes.CLOSE_LOGIN_MODAL }
  | { type: ActionTypes.SET_TOKEN; payload: string }
  | { type: ActionTypes.UPDATE_USER; payload: IUser; }
  | { type: ActionTypes.LOGIN; payload: IUser | null }
  | { type: ActionTypes.LOGOUT };

export type AuthDispatch = {
  [ActionTypes.OPEN_LOGIN_MODAL]: (payload?: OpenLoginModalPayload) => void;
  [ActionTypes.CLOSE_LOGIN_MODAL]: () => void;
  [ActionTypes.SET_TOKEN]: (payload: string) => void;
  [ActionTypes.UPDATE_USER]: (payload: CreateUserProfile | UpdateUserProfile) => Promise<void>;
  [ActionTypes.LOGIN]: (payload: IUser | null) => void;
  [ActionTypes.LOGOUT]: () => void;
};
