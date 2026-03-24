"use client";

import { useRouter } from "@daodao/i18n/navigation";
import { getStorage, StorageEnum } from "@daodao/shared";
import {
  createContext,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import type { CategoryType, IAction, IActionMakerResult, IActionMakerState } from "../types";
import { buildResult } from "../utils/store";
import { isValidCategory } from "../utils/validation";

// --- Reducer ---

type ActionMakerAction =
  | { type: "SET_NICKNAME"; payload: string }
  | { type: "SET_TOPIC"; payload: string }
  | { type: "SELECT_CATEGORY"; payload: CategoryType }
  | { type: "SET_SELECTED_TAGS"; payload: string[] }
  | { type: "SET_ACTIONS"; payload: IAction[] }
  | { type: "SELECT_ACTION"; payload: IAction }
  | {
      type: "SET_TRIGGER_TIMING";
      payload: { timing: string; periods: import("../types").PracticeTimePeriod[] };
    }
  | { type: "RESTORE"; payload: IActionMakerState }
  | { type: "RESET" }
  | { type: "SET_SESSION_ID"; payload: string }
  | { type: "SET_USED_REFINE"; payload: boolean };

const initialState: IActionMakerState = {
  userInput: {
    nickname: "",
    topic: "",
    category: null,
    selectedTags: [],
  },
  userSelection: {
    action: null,
    triggerTiming: "",
    triggerTimingPeriods: [],
  },
  generatedActions: [],
  sessionId: null,
  usedRefine: false,
};

function actionMakerReducer(
  state: IActionMakerState,
  action: ActionMakerAction
): IActionMakerState {
  switch (action.type) {
    case "SET_NICKNAME":
      return { ...state, userInput: { ...state.userInput, nickname: action.payload } };
    case "SET_TOPIC":
      return { ...state, userInput: { ...state.userInput, topic: action.payload } };
    case "SELECT_CATEGORY":
      return { ...state, userInput: { ...state.userInput, category: action.payload } };
    case "SET_SELECTED_TAGS":
      return {
        ...state,
        userInput: { ...state.userInput, selectedTags: action.payload },
      };
    case "SET_ACTIONS":
      return { ...state, generatedActions: action.payload };
    case "SELECT_ACTION":
      return {
        ...state,
        userSelection: { ...state.userSelection, action: action.payload },
      };
    case "SET_TRIGGER_TIMING":
      return {
        ...state,
        userSelection: {
          ...state.userSelection,
          triggerTiming: action.payload.timing,
          triggerTimingPeriods: action.payload.periods,
        },
      };
    case "RESTORE":
      return action.payload;
    case "RESET":
      return initialState;
    case "SET_SESSION_ID":
      return { ...state, sessionId: action.payload };
    case "SET_USED_REFINE":
      return { ...state, usedRefine: action.payload };
    default:
      return state;
  }
}

// --- Context ---

export type ActionMakerContextType = {
  state: IActionMakerState;
  result: IActionMakerResult | null;
  isHydrated: boolean;
  dispatch: React.Dispatch<ActionMakerAction>;
  navigateTo: (path: string, options?: { replace?: boolean }) => void;
  reset: () => void;
};

export const ActionMakerContext = createContext<ActionMakerContextType | null>(null);

// --- Provider ---

export function ActionMakerProvider({ children }: React.PropsWithChildren) {
  const router = useRouter();
  const [state, dispatch] = useReducer(actionMakerReducer, initialState);
  const [isHydrated, setIsHydrated] = useState(false);

  const navigateTo = useCallback(
    (path: string, options?: { replace?: boolean }) => {
      if (options?.replace) {
        router.replace(path);
      } else {
        router.push(path);
      }
    },
    [router]
  );

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
    getStorage(StorageEnum.ActionMaker).remove();
  }, []);

  const result = useMemo(() => buildResult(state), [state]);

  // Skip persisting initialState on first render (which overwrites good sessionStorage data)
  const isFirstRender = useRef(true);

  // Restore from sessionStorage on mount
  useEffect(() => {
    const stored = getStorage<IActionMakerState>(StorageEnum.ActionMaker).get();
    if (stored?.userInput && isValidCategory(stored.userInput.category)) {
      dispatch({
        type: "RESTORE",
        payload: {
          ...stored,
          userSelection: {
            ...stored.userSelection,
            triggerTimingPeriods: stored.userSelection?.triggerTimingPeriods ?? [],
          },
        },
      });
    }
    setIsHydrated(true);
  }, []);

  // Persist to sessionStorage synchronously on state change (before navigation/paint)
  useLayoutEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    getStorage<IActionMakerState>(StorageEnum.ActionMaker).set(state);
  }, [state]);

  const value = useMemo(
    () => ({ state, result, isHydrated, dispatch, navigateTo, reset }),
    [state, result, isHydrated, navigateTo, reset]
  );

  return <ActionMakerContext.Provider value={value}>{children}</ActionMakerContext.Provider>;
}
