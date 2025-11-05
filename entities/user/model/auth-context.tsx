'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import { mutate } from 'swr';
import { getTokenStorage } from '@/shared/lib/storage';
import { ApiError } from '@/shared/api';
import { onUnauthorized } from '@/shared/lib/auth-bus';
import {
  useGetApiV1UsersMe,
  usePostApiV1UsersMe,
  usePutApiV1UsersMe,
} from '@/generated/api/users.client';
import { AuthState, AuthActions, AuthActionTypes } from './auth-types';
import { mutateUserData } from '../lib/mutate-user-data';
import { authReducer } from './auth-reducer';
import {
  createInitialAuthState,
  isPermanentLogin,
  isTemporaryLogin,
} from './auth-state';

const AuthContext = createContext<AuthState | null>(null);
const AuthActionsContext = createContext<AuthActions | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthActions = () => {
  const context = useContext(AuthActionsContext);
  if (!context) {
    throw new Error('useAuthActions must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: React.PropsWithChildren) {
  const [state, dispatch] = useReducer(authReducer, createInitialAuthState());

  const { loginStatus, user } = state;

  const { trigger: triggerPostUser } = usePostApiV1UsersMe();

  const { trigger: triggerPutUser } = usePutApiV1UsersMe();

  const setToken = useCallback((payload: string) => {
    getTokenStorage().set(payload);
    dispatch({ type: AuthActionTypes.SET_TOKEN, payload });
  }, []);

  const logout = useCallback(() => {
    getTokenStorage().remove();
    dispatch({ type: AuthActionTypes.LOGOUT });
    mutate(() => true, undefined, { revalidate: false });
  }, []);

  const handleError = useCallback(
    (error: unknown) => {
      if (error instanceof ApiError && error.status === 401) {
        logout();
      }
    },
    [logout]
  );

  const updateUser = useCallback<AuthActions['updateUser']>(
    async (input) => {
      try {
        if (isTemporaryLogin(loginStatus, input)) {
          const result = await triggerPostUser(input);
          setToken(result?.data?.token ?? '');
          return;
        }
        if (isPermanentLogin(loginStatus, input)) {
          const updatedUser = {
            ...user,
            ...input,
          };
          await triggerPutUser(updatedUser);
          await mutateUserData(updatedUser);
        }
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
    [user, loginStatus, setToken, handleError, triggerPostUser, triggerPutUser]
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

  const { isValidating } = useGetApiV1UsersMe({
    swr: {
      enabled: !!state.token,
      onSuccess: (result) => {
        sessionActions.login(result?.data);
      },
      onError: handleError,
    },
  });

  useEffect(() => {
    if (state.isLoggingIn !== isValidating) {
      sessionActions.setLoading(isValidating);
    }
  }, [state.isLoggingIn, sessionActions, isValidating]);

  useEffect(() => {
    const off = onUnauthorized(() => sessionActions.logout());
    return off;
  }, [sessionActions]);

  return (
    <AuthContext.Provider value={state}>
      <AuthActionsContext.Provider value={sessionActions}>
        {children}
      </AuthActionsContext.Provider>
    </AuthContext.Provider>
  );
}
