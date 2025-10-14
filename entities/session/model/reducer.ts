import {
  SessionState,
  SessionAction,
  SessionActionTypes,
  SessionLoginStatus,
} from './types';
import { initialSessionState } from './state';
import { checkProfileComplete } from '../lib/check-profile-complete';

export const sessionReducer = (
  state: SessionState,
  action: SessionAction
): SessionState => {
  switch (action.type) {
    case SessionActionTypes.OPEN_LOGIN_MODAL: {
      return {
        ...initialSessionState,
        isOpenLoginModal: true,
      };
    }
    case SessionActionTypes.CLOSE_LOGIN_MODAL: {
      return {
        ...state,
        isOpenLoginModal: false,
      };
    }
    case SessionActionTypes.SET_LOADING: {
      return {
        ...state,
        isLoggingIn: action.payload,
      };
    }
    case SessionActionTypes.SET_TOKEN: {
      return {
        ...state,
        token: action.payload,
      };
    }
    case SessionActionTypes.UPDATE_USER:
    case SessionActionTypes.LOGIN: {
      if (!state.token) {
        return initialSessionState;
      }
      if (action.payload) {
        return {
          ...state,
          isComplete: checkProfileComplete(action.payload),
          isLoggedIn: true,
          isTemporary: false,
          user: action.payload,
          loginStatus: SessionLoginStatus.PERMANENT,
        };
      }
      return {
        ...state,
        isLoggedIn: false,
        isTemporary: true,
        user: null,
        loginStatus: SessionLoginStatus.TEMPORARY,
      };
    }
    case SessionActionTypes.LOGOUT: {
      return initialSessionState;
    }
    default:
      return state;
  }
};
