'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import { mutate as swrMutate } from 'swr';
import { getTokenStorage } from '@/shared/lib/storage';
import { ApiError, client, useMutate, useQuery } from '@/shared/api';
import { onUnauthorized } from '@/shared/lib/auth-bus';
import { AuthState, AuthActions, AuthActionTypes } from './auth-types';
import { authReducer } from './auth-reducer';
import { createInitialAuthState, isPermanent, isTemporary } from './auth-state';
import { UpdateUserSchema } from './constants';

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

  const mutate = useMutate();

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
      if (error instanceof ApiError && error.status === 401) {
        logout();
      }
    },
    [logout]
  );

  const removeNullValues = useCallback(<T extends Record<string, unknown>>(
    obj: T
  ): T => {
    if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
      return obj;
    }

    return Object.entries(obj).reduce((cleaned, [key, value]) => {
      const processedValue =
        value === null
          ? undefined
          : typeof value === 'object' && !Array.isArray(value)
            ? removeNullValues(value as Record<string, unknown>)
            : value;
      return {
        ...cleaned,
        [key]: processedValue,
      } as T;
    }, {} as T);
  }, []);

  const updateUser = useCallback<AuthActions['updateUser']>(
    async (input) => {
      try {
        if (isTemporary(state, input)) {
          // POST /api/v1/users/me - 建立新用戶
          const { data, error } = await client.POST('/api/v1/users/me', {
            body: input,
          });
          if (error) throw error;
          setToken(data?.data?.token ?? '');
          return;
        }
        if (isPermanent(state, input)) {
          const updatedUser: UpdateUserSchema = {
            ...(user || {}),
            ...(input || {}),
            contactList: {
              ...(user?.contactList || {}),
              ...(input?.contactList || {}),
            },
            birthDay: user?.birthDay,
          };
          // PUT /api/v1/users/me - 更新用戶資料
          const { data, error } = await client.PUT('/api/v1/users/me', {
            body: removeNullValues(updatedUser),
          });
          if (error) throw error;
          await mutate(['/api/v1/users/me'], data);
          await mutate(
            [
              '/api/v1/users/{id}',
              { params: { path: { id: data?.data?.id ?? '' } } },
            ],
            data
          );
          await mutate(
            [
              '/api/v1/users/custom-id/{customId}',
              { params: { path: { customId: data?.data?.customId ?? '' } } },
            ],
            data
          );
        }
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
    [state, user, mutate, setToken, handleError, removeNullValues]
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
  const { isLoading } = useQuery(
    '/api/v1/users/me',
    state.token ? {} : null,
    {
      onSuccess: (result) => {
        sessionActions.login(result?.data);
      },
      onError: handleError,
    }
  );

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
      <AuthActionsContext.Provider value={sessionActions}>
        {children}
      </AuthActionsContext.Provider>
    </AuthContext.Provider>
  );
}
