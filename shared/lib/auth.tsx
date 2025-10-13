'use client';

import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import { toast } from 'sonner';
import { mutate, SWRConfig } from 'swr';

import { HttpError } from '@/shared/lib/http';
import { getTokenStorage } from '@/shared/lib/storage';
import { createUserFormSchema, updateUserFormSchema } from '@/services/users';
import {
  postApiV1Users,
  putApiV1UsersId,
  useGetApiV1UsersMe,
} from '@/generated/endpoints/users';

import {
  AuthState,
  AuthDispatch,
  Action,
  ActionTypes,
  LoginStatus,
} from '../model/auth.type';

const initialState: AuthState = {
  isComplete: false,
  isLoggedIn: false,
  isLoggingIn: true,
  isTemporary: false,
  isOpenLoginModal: false,
  loginStatus: LoginStatus.EMPTY,
  token: null,
  user: null,
};

const AuthContext = createContext<AuthState | null>(null);
const AuthDispatchContext = createContext<AuthDispatch | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthDispatch = () => {
  const context = useContext(AuthDispatchContext);
  if (!context) {
    throw new Error('useAuthDispatch must be used within an AuthProvider');
  }
  return context;
};

const checkIsComplete = (data: AuthState['user']) => {
  if (!data) return false;

  const hasAnySocialCode = Object.values(data.contactList || '{}').some(
    (socialCode) => Boolean(socialCode)
  );
  if (!hasAnySocialCode) return false;

  const keys = [
    'name',
    'birthDay',
    'gender',
    'roleList',
    'wantToDoList',
    'tagList',
    'selfIntroduction',
  ] as const;

  return keys.every((key) =>
    Boolean(Array.isArray(data[key]) ? data[key].length : data[key])
  );
};

const authReducer = (state: AuthState, action: Action): AuthState => {
  switch (action.type) {
    case ActionTypes.OPEN_LOGIN_MODAL: {
      return {
        ...initialState,
        isOpenLoginModal: true,
      };
    }
    case ActionTypes.CLOSE_LOGIN_MODAL: {
      return {
        ...state,
        isOpenLoginModal: false,
      };
    }
    case ActionTypes.SET_LOADING: {
      return {
        ...state,
        isLoggingIn: action.payload,
      };
    }
    case ActionTypes.SET_TOKEN: {
      return {
        ...state,
        token: action.payload,
      };
    }
    case ActionTypes.UPDATE_USER:
    case ActionTypes.LOGIN: {
      if (!state.token) {
        return initialState;
      }
      if (action.payload) {
        return {
          ...state,
          isComplete: checkIsComplete(action.payload),
          isLoggedIn: true,
          isTemporary: false,
          user: action.payload,
          loginStatus: LoginStatus.PERMANENT,
        };
      }
      return {
        ...state,
        isLoggedIn: false,
        isTemporary: true,
        user: null,
        loginStatus: LoginStatus.TEMPORARY,
      };
    }
    case ActionTypes.LOGOUT: {
      return initialState;
    }
    default:
      return state;
  }
};

export function AuthProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const authDispatch = useMemo<AuthDispatch>(() => {
    const setToken = (payload: string) => {
      getTokenStorage().set(payload);
      dispatch({ type: ActionTypes.SET_TOKEN, payload });
    };
    const logout = () => {
      getTokenStorage().remove();
      dispatch({ type: ActionTypes.LOGOUT });
      mutate(() => true, undefined, { revalidate: false });
    };
    return {
      setToken,
      setLoading: (payload) => {
        dispatch({ type: ActionTypes.SET_LOADING, payload });
      },
      logout,
      login: (payload) => {
        dispatch({ type: ActionTypes.LOGIN, payload });
      },
      updateUser: async (input) => {
        switch (state.loginStatus) {
          case LoginStatus.TEMPORARY: {
            const arg = createUserFormSchema.parse(input);
            const { data } = await postApiV1Users(arg);
            if (data?.token && data?.user) {
              setToken(data.token);
              dispatch({
                type: ActionTypes.UPDATE_USER,
                payload: data.user,
              });
            }
            break;
          }
          case LoginStatus.PERMANENT: {
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
                type: ActionTypes.UPDATE_USER,
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
        dispatch({ type: ActionTypes.OPEN_LOGIN_MODAL });
      },
      closeLoginModal: () => {
        dispatch({ type: ActionTypes.CLOSE_LOGIN_MODAL });
      },
    };
  }, [state.loginStatus, state.user, dispatch]);

  const handleError = (error: unknown) => {
    if (error instanceof HttpError) {
      if (error.status === 401) {
        authDispatch.logout();
      } else {
        toast.error(error.info?.message ?? '發生錯誤');
      }
      return;
    }
    toast.error('系統異常，請稍後再試');
  };

  const { isLoading } = useGetApiV1UsersMe({
    swr: {
      enabled: !!state.token,
      onSuccess: (data) => {
        if (data.data) {
          authDispatch.login(data.data);
        }
      },
      onError: handleError,
    },
  });

  useEffect(() => {
    if (state.isLoggingIn !== isLoading) {
      authDispatch.setLoading(isLoading);
    }
  }, [state.isLoggingIn, authDispatch, isLoading]);

  return (
    <AuthContext.Provider value={state}>
      <AuthDispatchContext.Provider value={authDispatch}>
        <SWRConfig value={(props) => ({ ...props, onError: handleError })}>
          {children}
        </SWRConfig>
      </AuthDispatchContext.Provider>
    </AuthContext.Provider>
  );
}
