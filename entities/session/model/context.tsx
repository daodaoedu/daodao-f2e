'use client';

import {
  createContext,
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
  usePostApiV1UsersMe,
  usePutApiV1UsersMe,
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

  const { trigger: triggerPostUser } = usePostApiV1UsersMe();

  const { trigger: triggerPutUser } = usePutApiV1UsersMe();

  const sessionActions = useMemo<SessionActions>(() => {
    const setToken = (payload: string) => {
      getTokenStorage().set(payload);
      dispatch({ type: SessionActionTypes.SET_TOKEN, payload });
    };
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
            const result = await triggerPostUser(arg);
            setToken(result?.data.token);
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
    triggerPostUser,
    triggerPutUser,
  ]);

  const handleError = (error: unknown) => {
    if (error instanceof ApiError && error.status === 401) {
      sessionActions.logout();
    }
  };

  const { isValidating } = useGetApiV1UsersMe({
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
    if (state.isLoggingIn !== isValidating) {
      sessionActions.setLoading(isValidating);
    }
  }, [state.isLoggingIn, sessionActions, isValidating]);

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
