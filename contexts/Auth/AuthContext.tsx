import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import toast from 'react-hot-toast';
import { useRouter, usePathname } from 'next/navigation';
import useSWR, { SWRConfig } from 'swr';
import { useDispatch } from 'react-redux';

import { fetchUserByToken, userLogout } from '@/redux/actions/user';
import { HttpError } from '@/services/httpClient';
import {
  getRedirectionStorage,
  getReminderStorage,
  getTokenStorage,
} from '@/utils/storage';
import {
  createUser,
  createUserSchema,
  getUserMe,
  IUser,
  updateUser,
  updateUserSchema,
} from '@/services/users';

import LoginModal from './LoginModal';
import {
  AuthState,
  AuthDispatch,
  Action,
  ActionTypes,
  LoginStatus,
} from './type';

const LOGIN_TYPE = 'login-type';

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

  // TODO: 待移除 redux，為了同步資訊
  const reduxDispatch = useDispatch();

  const authDispatch = useMemo<AuthDispatch>(() => {
    const setToken = (payload: string) => {
      getTokenStorage().set(payload);
      dispatch({ type: ActionTypes.SET_TOKEN, payload });
    };
    const logout = () => {
      // TODO: 待移除 localStorage.clear，目前只是為了讓 redux 同步登出的暫解
      reduxDispatch(userLogout());
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
        // TODO: remove after removed redux
        if ((input as unknown as { _id: string })?._id) {
          setToken((input as unknown as { token: string })?.token);
          dispatch({ type: ActionTypes.UPDATE_USER, payload: input as IUser });
          return;
        }

        switch (state.loginStatus) {
          case LoginStatus.TEMPORARY: {
            const request = createUserSchema.parse(input);
            const { token, user } = await createUser(request);
            setToken(token);
            dispatch({ type: ActionTypes.UPDATE_USER, payload: user });
            break;
          }
          case LoginStatus.PERMANENT: {
            const request = updateUserSchema.parse({
              ...state.user,
              ...input,
            });
            const payload = await updateUser(request);
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

  useSWR(state.token ? [getUserMe.name, state.token] : null, getUserMe, {
    onSuccess: authDispatch.login,
    onError: handleError,
  });

  useEffect(() => {
    const handleToken = (token?: string) => {
      if (!token) return;
      // TODO: 待移除 redux，為了同步資訊
      reduxDispatch(fetchUserByToken(token));
      authDispatch.setToken(token);
    };

    const receiveMessage = (
      event: MessageEvent<{
        type: typeof LOGIN_TYPE;
        payload: { token: string };
      }>
    ) => {
      if (event.origin !== window.location.origin) return;
      if (event.data.type === LOGIN_TYPE) {
        handleToken(event.data.payload.token);
      }
    };
    const removeLoginListener = () => {
      window.removeEventListener('message', receiveMessage, false);
    };

    handleToken(getTokenStorage().get());

    if (state.loginStatus === LoginStatus.PERMANENT) {
      removeLoginListener();
    } else {
      window.addEventListener('message', receiveMessage, false);
    }

    return removeLoginListener;
  }, [
    state.loginStatus,
    authDispatch.setToken,
    authDispatch.logout,
    reduxDispatch,
  ]);

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

interface ProtectedComponentProps extends PropsWithChildren {
  redirectOnCancel?: string;
  onlyCheckToken?: boolean;
}

export const ProtectedComponent = ({
  children,
  redirectOnCancel,
  onlyCheckToken = false,
}: ProtectedComponentProps) => {
  const router = useRouter();
  const opened = useRef(false);
  const { isLoggedIn, isOpenLoginModal, token } = useAuth();
  const { openLoginModal } = useAuthDispatch();
  const requiresLogin = onlyCheckToken ? !token : !isLoggedIn;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (requiresLogin && !token) {
      timer = setTimeout(() => {
        opened.current = true;
        openLoginModal();
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [requiresLogin, token, openLoginModal]);

  useEffect(() => {
    if (
      redirectOnCancel &&
      !isOpenLoginModal &&
      opened.current &&
      requiresLogin &&
      !token
    ) {
      router.replace(redirectOnCancel);
    }
  }, [
    redirectOnCancel,
    isOpenLoginModal,
    opened.current,
    requiresLogin,
    token,
    router.replace,
  ]);

  if (requiresLogin) return <div className="h-screen w-screen" />;

  return children;
};

export const sendLoginEvent = (token: string) => {
  getTokenStorage().remove();

  if (
    window.opener &&
    window.opener.location.origin === window.location.origin
  ) {
    window.opener.postMessage(
      { type: LOGIN_TYPE, payload: { token } },
      window.location.origin
    );
    window.close();
    return true;
  }

  return false;
};
