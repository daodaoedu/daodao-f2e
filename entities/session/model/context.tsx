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
  useGetApiV1UsersMe,
  usePostApiV1UsersMe,
  usePutApiV1UsersMe,
} from '@/api/users.client';
import { ApiError } from '@/shared/api';
import { onUnauthorized } from '@/shared/lib/auth-bus';
import { SessionState, SessionActions, SessionActionTypes } from './types';
import { sessionReducer } from './reducer';
import {
  createInitialSessionState,
  isPermanentLogin,
  isTemporaryLogin,
} from './state';

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

  const { loginStatus, user } = state;

  const { trigger: triggerPostUser } = usePostApiV1UsersMe();

  const { trigger: triggerPutUser } = usePutApiV1UsersMe();

  const setToken = useCallback((payload: string) => {
    getTokenStorage().set(payload);
    dispatch({ type: SessionActionTypes.SET_TOKEN, payload });
  }, []);

  const logout = useCallback(() => {
    getTokenStorage().remove();
    dispatch({ type: SessionActionTypes.LOGOUT });
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

  const updateUser = useCallback<SessionActions['updateUser']>(
    async (input) => {
      try {
        if (isTemporaryLogin(loginStatus, input)) {
          const result = await triggerPostUser(input);
          setToken(result?.data.token);
          return;
        }
        if (isPermanentLogin(loginStatus, input)) {
          await triggerPutUser({
            ...user,
            ...input,
          });
        }
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
    [user, loginStatus, setToken, handleError, triggerPostUser, triggerPutUser]
  );

  const sessionActions = useMemo<SessionActions>(
    () => ({
      setToken,
      setLoading: (payload) => {
        dispatch({ type: SessionActionTypes.SET_LOADING, payload });
      },
      logout,
      login: (payload) => {
        dispatch({ type: SessionActionTypes.LOGIN, payload });
      },
      updateUser,
      openLoginModal: () => {
        logout();
        dispatch({ type: SessionActionTypes.OPEN_LOGIN_MODAL });
      },
      closeLoginModal: () => {
        dispatch({ type: SessionActionTypes.CLOSE_LOGIN_MODAL });
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
    <SessionContext.Provider value={state}>
      <SessionActionsContext.Provider value={sessionActions}>
        {children}
      </SessionActionsContext.Provider>
    </SessionContext.Provider>
  );
}
