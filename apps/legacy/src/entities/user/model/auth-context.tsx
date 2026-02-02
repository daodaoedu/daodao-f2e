"use client";

import { createUser, updateCurrentUser, useCurrentUser } from "@daodao/api";
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import { mutate as swrMutate } from "swr";
import { onUnauthorized } from "@/shared/lib/auth-bus";
import type { ApiError } from "@/shared/lib/error-handler";
import { getTokenStorage } from "@/shared/lib/storage";
import { authReducer } from "./auth-reducer";
import { createInitialAuthState, isPermanent, isTemporary } from "./auth-state";
import { type AuthActions, AuthActionTypes, type AuthState } from "./auth-types";
import type { UpdateUserSchema, UserProfile } from "./constants";

const AuthContext = createContext<AuthState | null>(null);
const AuthActionsContext = createContext<AuthActions | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const useAuthActions = () => {
  const context = useContext(AuthActionsContext);
  if (!context) {
    throw new Error("useAuthActions must be used within an AuthProvider");
  }
  return context;
};

export function AuthProvider({ children }: React.PropsWithChildren) {
  const [state, dispatch] = useReducer(authReducer, createInitialAuthState());

  const { user } = state;

  const setToken = useCallback((payload: string) => {
    getTokenStorage().set(payload);
    dispatch({ type: AuthActionTypes.SET_TOKEN, payload });
  }, []);

  const logout = useCallback(() => {
    getTokenStorage().remove();
    dispatch({ type: AuthActionTypes.LOGOUT });
    swrMutate(() => true, undefined, { revalidate: false });
  }, []);

  const handleError = useCallback(
    (error: unknown) => {
      if (
        error &&
        typeof error === "object" &&
        "status" in error &&
        (error as ApiError).status === 401
      ) {
        logout();
      }
    },
    [logout]
  );

  const removeNullValues = useCallback(<T extends Record<string, unknown>>(obj: T): T => {
    if (obj === null || typeof obj !== "object" || Array.isArray(obj)) {
      return obj;
    }

    const cleaned = {} as T;
    for (const [key, value] of Object.entries(obj)) {
      const processedValue =
        value === null
          ? undefined
          : typeof value === "object" && !Array.isArray(value)
            ? removeNullValues(value as Record<string, unknown>)
            : value;
      cleaned[key as keyof T] = processedValue as T[keyof T];
    }
    return cleaned;
  }, []);

  const updateUser = useCallback<AuthActions["updateUser"]>(
    async (input) => {
      try {
        if (isTemporary(state, input)) {
          // POST /api/v1/users - 建立新用戶
          const { error } = await createUser(input as Parameters<typeof createUser>[0]);
          if (error) throw error;
          // createUser 返回的結構需要確認，這裡先假設有 token
          // 實際上可能需要從其他地方獲取 token
          setToken("");
          return;
        }
        if (isPermanent(state, input)) {
          const updatedUser: UpdateUserSchema = {
            ...(user || {}),
            ...(input as UpdateUserSchema),
            contactList: {
              ...(user?.contactList || {}),
              ...((input as UpdateUserSchema)?.contactList || {}),
            },
            birthDay: user?.birthDay,
          };
          // PUT /api/v1/users/me - 更新用戶資料
          const { error } = await updateCurrentUser(
            removeNullValues(updatedUser) as Parameters<typeof updateCurrentUser>[0]
          );
          if (error) throw error;
          // 更新後需要重新獲取用戶資料，這裡先簡化處理
          // 可以通過 swrMutate 來刷新緩存
          swrMutate("/api/v1/users/me");
        }
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
    [state, user, setToken, handleError, removeNullValues]
  );

  const sessionActions = useMemo<AuthActions>(
    () => ({
      setToken,
      setLoading: (payload) => {
        dispatch({ type: AuthActionTypes.SET_LOADING, payload });
      },
      logout,
      login: (payload) => {
        dispatch({ type: AuthActionTypes.LOGIN, payload });
      },
      updateUser,
      openLoginModal: () => {
        logout();
        dispatch({ type: AuthActionTypes.OPEN_LOGIN_MODAL });
      },
      closeLoginModal: () => {
        dispatch({ type: AuthActionTypes.CLOSE_LOGIN_MODAL });
      },
    }),
    [setToken, logout, updateUser]
  );

  // GET /api/v1/users/me - 取得當前用戶資料
  const { data: userData, error: userError, isLoading } = useCurrentUser();

  useEffect(() => {
    if (userData?.data) {
      // FormattedUserResponse 與 UserProfile 類型不完全匹配，需要類型轉換
      sessionActions.login(userData.data as UserProfile);
    }
  }, [userData, sessionActions]);

  useEffect(() => {
    if (userError) {
      handleError(userError);
    }
  }, [userError, handleError]);

  useEffect(() => {
    if (state.isLoggingIn !== isLoading) {
      sessionActions.setLoading(isLoading);
    }
  }, [state.isLoggingIn, sessionActions, isLoading]);

  useEffect(() => {
    const off = onUnauthorized(() => sessionActions.logout());
    return off;
  }, [sessionActions]);

  return (
    <AuthContext.Provider value={state}>
      <AuthActionsContext.Provider value={sessionActions}>{children}</AuthActionsContext.Provider>
    </AuthContext.Provider>
  );
}
