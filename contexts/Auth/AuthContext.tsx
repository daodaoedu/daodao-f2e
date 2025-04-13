import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import toast from 'react-hot-toast';
import { useRouter, usePathname } from 'next/navigation';
import { SWRConfig } from 'swr';

import { HttpError } from '@/services/core';
import {
  getRedirectionStorage,
  getReminderStorage,
  getTokenStorage,
} from '@/utils/storage';
import {
  userAPI,
  createUserSchema,
  updateUserSchema,
  useUserMe,
} from '@/services/modules/users';

import LoginModal from './LoginModal';
import {
  AuthState,
  AuthDispatch,
  Action,
  ActionTypes,
  LoginStatus,
} from './type';
import { registerLoginListener } from './utils';

const initialState: AuthState = {
  isComplete: false,
  isLoggedIn: false,
  isTemporary: false,
  isOpenLoginModal: false,
  loginStatus: LoginStatus.EMPTY,
  token: null,
  user: null,
  redirectUrl: '',
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
        redirectUrl: action.payload || '',
      };
    }
    case ActionTypes.CLOSE_LOGIN_MODAL: {
      return {
        ...state,
        isOpenLoginModal: false,
        redirectUrl: '',
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
  const router = useRouter();
  const pathname = usePathname();

  const authDispatch = useMemo<AuthDispatch>(() => {
    const setToken = (payload: string) => {
      getTokenStorage().set(payload);
      dispatch({ type: ActionTypes.SET_TOKEN, payload });
    };
    const logout = () => {
      getTokenStorage().remove();
      getRedirectionStorage().remove();
      dispatch({ type: ActionTypes.LOGOUT });
    };
    return {
      setToken,
      logout,
      login: (payload) => {
        dispatch({ type: ActionTypes.LOGIN, payload });
      },
      updateUser: async (input) => {
        switch (state.loginStatus) {
          case LoginStatus.TEMPORARY: {
            const arg = createUserSchema.parse(input);
            const { token, user } = await userAPI.create('', { arg });
            setToken(token);
            dispatch({ type: ActionTypes.UPDATE_USER, payload: user });
            break;
          }
          case LoginStatus.PERMANENT: {
            const arg = updateUserSchema.parse({
              ...state.user,
              ...input,
            });
            const payload = await userAPI.update('', { arg });
            dispatch({ type: ActionTypes.UPDATE_USER, payload });
            break;
          }
          default: {
            break;
          }
        }
      },
      openLoginModal: (payload) => {
        logout();
        if (typeof payload === 'string') {
          getRedirectionStorage().set(payload);
        }
        dispatch({ type: ActionTypes.OPEN_LOGIN_MODAL, payload });
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

  useUserMe({
    token: state.token,
    onSuccess: authDispatch.login,
    onError: handleError,
  });

  useEffect(() => {
    const handleToken = (token: string) => {
      authDispatch.setToken(token);
    };

    const unregisterLoginListener = registerLoginListener(
      state.loginStatus,
      handleToken
    );

    return unregisterLoginListener;
  }, [state.loginStatus, authDispatch.setToken, authDispatch.logout]);

  useEffect(() => {
    switch (state.loginStatus) {
      case LoginStatus.TEMPORARY: {
        const redirectUrl = state.redirectUrl || getRedirectionStorage().get();
        getReminderStorage().remove();
        authDispatch.closeLoginModal();
        router.replace(redirectUrl || '/signin');
        break;
      }
      case LoginStatus.PERMANENT: {
        const redirectUrl = state.redirectUrl || getRedirectionStorage().get();
        const reminder = getReminderStorage().get();
        getReminderStorage().set(
          typeof reminder === 'number' ? reminder + 1 : 1
        );
        authDispatch.closeLoginModal();
        if (redirectUrl) router.replace(redirectUrl);
        break;
      }
      default:
        break;
    }
  }, [
    state.loginStatus,
    state.redirectUrl,
    router.replace,
    authDispatch.closeLoginModal,
  ]);

  useEffect(() => {
    const redirectionStorage = getRedirectionStorage();
    const redirection = redirectionStorage.get();

    if (redirection?.split('?')[0] === pathname) {
      redirectionStorage.remove();
    }
  }, [pathname]);

  return (
    <AuthContext.Provider value={state}>
      <AuthDispatchContext.Provider value={authDispatch}>
        <SWRConfig value={(props) => ({ ...props, onError: handleError })}>
          {children}
        </SWRConfig>
        <LoginModal
          isOpen={state.isOpenLoginModal}
          keepMounted={!state.isLoggedIn}
          onClose={authDispatch.closeLoginModal}
        />
      </AuthDispatchContext.Provider>
    </AuthContext.Provider>
  );
}
