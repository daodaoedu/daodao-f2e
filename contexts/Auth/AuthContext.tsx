import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { mutate, SWRConfig } from 'swr';

import { HttpError } from '@/utils/http';
import {
  getRedirectionStorage,
  getReminderStorage,
  getTokenStorage,
} from '@/utils/storage';
import {
  userAPI,
  createUserFormSchema,
  updateUserFormSchema,
} from '@/services/users';
import { useUserMe } from '@/features/users';

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

  return keys.every((key) => Boolean(Array.isArray(data[key]) ? data[key].length : data[key]));
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
  const [callbacks, setCallbacks] = useState({
    successCallback: () => {},
    registerCallback: () => {},
  });
  const router = useRouter();

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
        const reminderStorage = getReminderStorage();
        const reminder = reminderStorage.get();
        authDispatch.closeLoginModal();
        if (payload) {
          reminderStorage.set(typeof reminder === 'number' ? reminder + 1 : 1);
          callbacks.successCallback();
        } else {
          reminderStorage.remove();
          callbacks.registerCallback();
        }
      },
      updateUser: async (input) => {
        switch (state.loginStatus) {
          case LoginStatus.TEMPORARY: {
            const arg = createUserFormSchema.parse(input);
            const { token, user } = await userAPI.create('', { arg });
            setToken(token);
            dispatch({ type: ActionTypes.UPDATE_USER, payload: user });
            break;
          }
          case LoginStatus.PERMANENT: {
            const arg = updateUserFormSchema.parse({
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
        const getRelativeUrl = () => window.location.href.replace(window.location.origin, '');

        const redirectPath = getRelativeUrl();

        const defaultRegisterCallback = () => {
          router.replace('/onboarding');
        };

        const successCallback = async () => {
          const currentPath = getRelativeUrl();
          getRedirectionStorage().set(redirectPath);
          if (currentPath !== redirectPath) {
            await router.replace(redirectPath);
          }
          payload?.successCallback?.();
        };
        const registerCallback = () => {
          if (payload?.registerCallback) {
            payload.registerCallback(defaultRegisterCallback);
          } else {
            defaultRegisterCallback();
          }
        };
        logout();
        setCallbacks({ successCallback, registerCallback });
        dispatch({ type: ActionTypes.OPEN_LOGIN_MODAL });
      },
      closeLoginModal: () => {
        dispatch({ type: ActionTypes.CLOSE_LOGIN_MODAL });
      },
    };
  }, [state.loginStatus, state.user, callbacks, dispatch, router.replace]);

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

  const { isLoading } = useUserMe({
    token: state.token,
    onSuccess: authDispatch.login,
    onError: handleError,
  });

  useEffect(() => {
    if (state.isLoggingIn !== isLoading) {
      authDispatch.setLoading(isLoading);
    }
  }, [state.isLoggingIn, isLoading]);

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

  return (
    <AuthContext.Provider value={state}>
      <AuthDispatchContext.Provider value={authDispatch}>
        <SWRConfig value={(props) => ({ ...props, onError: handleError })}>
          {children}
        </SWRConfig>
        <LoginModal
          isOpen={state.isOpenLoginModal}
          onClose={authDispatch.closeLoginModal}
        />
      </AuthDispatchContext.Provider>
    </AuthContext.Provider>
  );
}
