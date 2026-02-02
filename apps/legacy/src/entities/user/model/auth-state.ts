import { getTokenStorage } from "@/shared/lib/storage";
import { AuthLoginStatus, type AuthState } from "./auth-types";
import type { CreateUserSchema, UpdateUserSchema } from "./constants";

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

export const isTemporary = (state: AuthState, input: CreateUserSchema): input is CreateUserSchema =>
  state.loginStatus === AuthLoginStatus.TEMPORARY;

export const isPermanent = (state: AuthState, input: UpdateUserSchema): input is UpdateUserSchema =>
  state.loginStatus === AuthLoginStatus.PERMANENT;
