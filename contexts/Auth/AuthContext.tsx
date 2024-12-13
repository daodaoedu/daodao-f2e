import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import useSWR, { SWRConfig } from "swr";
import { useDispatch } from "react-redux";

import { fetchUserByToken, userLogout } from "@/redux/actions/user";
import {
  getRedirectionStorage,
  getReminderStorage,
  getTokenStorage,
} from "@/utils/storage";
import {
  createUserProfile,
  createUserProfileSchema,
  fetchUserProfile,
  updateUserProfile,
  updateUserProfileSchema,
} from "@/services/users";

import LoginModal from "./LoginModal";
import {
  AuthState,
  AuthDispatch,
  Action,
  ActionTypes,
  LoginStatus,
} from "./type";

const LOGIN_TYPE = "login-type";

const initialState: AuthState = {
  isComplete: false,
  isLoggedIn: false,
  isTemporary: false,
  isOpenLoginModal: false,
  loginStatus: LoginStatus.EMPTY,
  token: null,
  user: null,
  redirectUrl: "",
};

const AuthContext = createContext<AuthState | null>(null);
const AuthDispatchContext = createContext<AuthDispatch | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const useAuthDispatch = () => {
  const context = useContext(AuthDispatchContext);
  if (!context) {
    throw new Error("useAuthDispatch must be used within an AuthProvider");
  }
  return context;
};

const checkIsComplete = (data: AuthState["user"]) => {
  if (!data) return false;

  const hasAnySocialCode = Object.values(data.contactList || "{}").some(
    (socialCode) => Boolean(socialCode)
  );
  if (!hasAnySocialCode) return false;

  const keys = [
    "name",
    "birthDay",
    "gender",
    "roleList",
    "wantToDoList",
    "tagList",
    "selfIntroduction",
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
        redirectUrl: action.payload || "",
      };
    }
    case ActionTypes.CLOSE_LOGIN_MODAL: {
      return {
        ...state,
        isOpenLoginModal: false,
        redirectUrl: "",
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
        const reminder = getReminderStorage().get();
        getReminderStorage().set(
          typeof reminder === "number" ? reminder + 1 : 1
        );
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
        switch (state.loginStatus) {
          case LoginStatus.TEMPORARY: {
            const request = createUserProfileSchema.parse(input);
            const { token, user } = await createUserProfile(request);
            setToken(token);
            dispatch({ type: ActionTypes.UPDATE_USER, payload: user });
            break;
          }
          case LoginStatus.PERMANENT: {
            const request = updateUserProfileSchema.parse({
              ...state.user,
              ...input,
            });
            const payload = await updateUserProfile(request);
            dispatch({ type: ActionTypes.UPDATE_USER, payload });
            break;
          }
        }
      },
      openLoginModal: (payload) => {
        logout();
        if (typeof payload === "string") {
          getRedirectionStorage().set(payload);
        }
        dispatch({ type: ActionTypes.OPEN_LOGIN_MODAL, payload });
      },
      closeLoginModal: () => {
        dispatch({ type: ActionTypes.CLOSE_LOGIN_MODAL });
      },
    };
  }, [state.loginStatus, state.user, dispatch]);

  const handleError = (error?: { status?: number }) => {
    if (error?.status === 401) {
      authDispatch.logout();
    }
  };

  useSWR(
    state.token ? [fetchUserProfile.name, state.token] : null,
    fetchUserProfile,
    {
      onSuccess: authDispatch.login,
      onError: handleError,
    }
  );

  useEffect(() => {
    const handleToken = (token: string) => {
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
      window.removeEventListener("message", receiveMessage, false);
    };

    handleToken(getTokenStorage().get());

    if (state.loginStatus === LoginStatus.PERMANENT) {
      removeLoginListener();
    } else {
      window.addEventListener("message", receiveMessage, false);
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
        authDispatch.closeLoginModal();
        router.replace(redirectUrl || "/signin");
        break;
      }
      case LoginStatus.PERMANENT: {
        const redirectUrl = state.redirectUrl || getRedirectionStorage().get();
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

    if (redirectionStorage.get() === pathname) {
      redirectionStorage.remove();
    }
  }, [pathname]);

  return (
    <AuthContext.Provider value={state}>
      <AuthDispatchContext.Provider value={authDispatch}>
        <SWRConfig value={{ onError: handleError }}>{children}</SWRConfig>
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
  const { user, isLoggedIn, isOpenLoginModal, token } = useAuth();
  const { openLoginModal } = useAuthDispatch();
  const requiresLoginModal = onlyCheckToken ? !token : !isLoggedIn;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (requiresLoginModal) {
      timer = setTimeout(() => {
        opened.current = true;
        openLoginModal();
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [requiresLoginModal, openLoginModal]);

  useEffect(() => {
    if (
      redirectOnCancel &&
      !isOpenLoginModal &&
      opened.current &&
      requiresLoginModal
    ) {
      router.replace(redirectOnCancel);
    }
  }, [
    redirectOnCancel,
    isOpenLoginModal,
    opened.current,
    requiresLoginModal,
    router.replace,
  ]);

  if (!user) return <div className="h-screen w-screen" />;

  return children;
};

export const sendLoginEvent = (token: string) => {
  if (!token) {
    // TODO: 處理沒 token 的狀況
    return;
  }

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
  } else {
    const redirection = getRedirectionStorage().get();
    getTokenStorage().set(token);
    window.location.replace(redirection || "/");
  }
};
