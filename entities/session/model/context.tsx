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
import { createUserFormSchema, updateUserFormSchema } from '@/services/users';
import {
  postApiV1Users,
  putApiV1UsersId,
  useGetApiV1UsersMe,
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
            const arg = createUserFormSchema.parse(input);
            const { data } = await postApiV1Users(arg);
            if (data?.token && data?.user) {
              setToken(data.token);
              dispatch({
                type: SessionActionTypes.UPDATE_USER,
                payload: data.user,
              });
            }
            break;
          }
          case SessionLoginStatus.PERMANENT: {
            if (!state.user.id) {
              return;
            }
            const arg = updateUserFormSchema.parse({
              ...state.user,
              ...input,
            });
            const { data } = await putApiV1UsersId(state.user.id, arg);
            if (data) {
              dispatch({
                type: SessionActionTypes.UPDATE_USER,
                payload: data,
              });
            }
            break;
          }
          default: {
            break;
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
  }, [state.loginStatus, state.user]);

  const handleError = (error: unknown) => {
    if (error instanceof ApiError && error.status === 401) {
      sessionActions.logout();
    }
  };

  const { isLoading } = useGetApiV1UsersMe({
    swr: {
      enabled: !!state.token,
      onSuccess: (data) => {
        if (data.data) {
          sessionActions.login(data.data);
        }
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
