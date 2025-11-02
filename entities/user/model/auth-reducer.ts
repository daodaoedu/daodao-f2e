import {
  AuthState,
  AuthAction,
  AuthActionTypes,
  AuthLoginStatus,
} from './auth-types';
import { initialAuthState } from './auth-state';
import { checkProfileComplete } from '../lib/check-profile-complete';

export const authReducer = (
  state: AuthState,
  action: AuthAction
): AuthState => {
  switch (action.type) {
    case AuthActionTypes.OPEN_LOGIN_MODAL: {
      return {
        ...initialAuthState,
        isOpenLoginModal: true,
      };
    }
    case AuthActionTypes.CLOSE_LOGIN_MODAL: {
      return {
        ...state,
        isOpenLoginModal: false,
      };
    }
    case AuthActionTypes.SET_LOADING: {
      return {
        ...state,
        isLoggingIn: action.payload,
      };
    }
    case AuthActionTypes.SET_TOKEN: {
      return {
        ...state,
        token: action.payload,
      };
    }
    case AuthActionTypes.UPDATE_USER:
    case AuthActionTypes.LOGIN: {
      if (!state.token) {
        return initialAuthState;
      }
      if (action.payload) {
        return {
          ...state,
          isComplete: checkProfileComplete(action.payload),
          isLoggedIn: true,
          isTemporary: false,
          user: action.payload,
          loginStatus: AuthLoginStatus.PERMANENT,
        };
      }
      return {
        ...state,
        isLoggedIn: false,
        isTemporary: true,
        user: null,
        loginStatus: AuthLoginStatus.TEMPORARY,
      };
    }
    case AuthActionTypes.LOGOUT: {
      return initialAuthState;
    }
    default:
      return state;
  }
};
