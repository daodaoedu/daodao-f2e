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
import {
  postApiV1UsersBody,
  putApiV1UsersIdBody,
} from '@/generated/endpoints/users.zod';
import {
  useGetApiV1UsersMe,
  usePostApiV1Users,
  usePutApiV1UsersId,
} from '@/generated/endpoints/users';
import { ApiError } from '@/services/fetcher';
import { onUnauthorized } from '@/shared/lib/auth-bus';
import {
  SessionState,
  SessionActions,
  SessionActionTypes,
  SessionLoginStatus,
} from './types';
import { sessionReducer } from './reducer';
import { createInitialSessionState } from './state';

const SessionContext = createContext<SessionState | null>(null);
const SessionActionsContext = createContext<SessionActions | null>(null);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within an SessionProvider');
  }
  return context;
};

export const useSessionActions = () => {
  const context = useContext(SessionActionsContext);
  if (!context) {
    throw new Error('useSessionActions must be used within an SessionProvider');
  }
  return context;
};

export function SessionProvider({ children }: React.PropsWithChildren) {
  const [state, dispatch] = useReducer(
    sessionReducer,
    createInitialSessionState()
  );

  const setToken = useCallback(
    (payload: string) => {
      getTokenStorage().set(payload);
      dispatch({ type: SessionActionTypes.SET_TOKEN, payload });
    },
    [dispatch]
  );

  const { trigger: triggerPostUser } = usePostApiV1Users({
    swr: {
      onSuccess: ({ data }) => setToken(data?.token ?? ''),
    },
  });

  const { trigger: triggerPutUser } = usePutApiV1UsersId(state.user?.id ?? '');

  const sessionActions = useMemo<SessionActions>(() => {
    const logout = () => {
      getTokenStorage().remove();
      dispatch({ type: SessionActionTypes.LOGOUT });
      mutate(() => true, undefined, { revalidate: false });
    };
    return {
      setToken,
      setLoading: (payload) => {
        dispatch({ type: SessionActionTypes.SET_LOADING, payload });
      },
      logout,
      login: (payload) => {
        dispatch({ type: SessionActionTypes.LOGIN, payload });
      },
      updateUser: async (input) => {
        switch (state.loginStatus) {
          case SessionLoginStatus.TEMPORARY: {
            const arg = postApiV1UsersBody.parse(input);
            await triggerPostUser(arg);
            break;
          }
          case SessionLoginStatus.PERMANENT: {
            const arg = putApiV1UsersIdBody.parse({
              ...state.user,
              ...input,
            });
            await triggerPutUser(arg);
            break;
          }
          default: {
            throw new Error('Invalid login status');
          }
        }
      },
      openLoginModal: () => {
        logout();
        dispatch({ type: SessionActionTypes.OPEN_LOGIN_MODAL });
      },
      closeLoginModal: () => {
        dispatch({ type: SessionActionTypes.CLOSE_LOGIN_MODAL });
      },
    };
  }, [
    state.loginStatus,
    state.user,
    setToken,
    triggerPostUser,
    triggerPutUser,
  ]);

  const handleError = (error: unknown) => {
    if (error instanceof ApiError && error.status === 401) {
      sessionActions.logout();
    }
  };

  const { isLoading } = useGetApiV1UsersMe({
    swr: {
      enabled: !!state.token,
      onSuccess: (result) => {
        const user = result?.data ?? null;
        sessionActions.login(user);
      },
      onError: handleError,
    },
  });

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
    <SessionContext.Provider value={state}>
      <SessionActionsContext.Provider value={sessionActions}>
        {children}
      </SessionActionsContext.Provider>
    </SessionContext.Provider>
  );
}
