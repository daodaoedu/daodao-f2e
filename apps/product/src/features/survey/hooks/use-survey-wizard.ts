"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import type { CreateSurveyInput } from "../schema";
import type { AIGeneratedQuestion, AIGenerateInput } from "../types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type WizardStep = "purpose" | "generate" | "edit" | "settings" | "publish";

interface WizardState {
  currentStep: WizardStep;
  survey: CreateSurveyInput;
  aiGeneratedQuestions: AIGeneratedQuestion[] | null;
  isGenerating: boolean;
  draftKey: string;
}

type WizardAction =
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "GO_TO_STEP"; step: WizardStep }
  | { type: "SET_TITLE"; title: string }
  | { type: "SET_DESCRIPTION"; description: string }
  | { type: "SET_PURPOSE"; purpose: string }
  | { type: "SET_TONE"; tone: AIGenerateInput["tone"] }
  | { type: "SET_AUDIENCE"; audience: string }
  | { type: "SET_QUESTION_COUNT"; count: number }
  | { type: "SET_GENERATED_QUESTIONS"; questions: AIGeneratedQuestion[] }
  | { type: "SET_IS_GENERATING"; isGenerating: boolean }
  | { type: "ADD_QUESTION"; question: CreateSurveyInput["questions"][number] }
  | {
      type: "UPDATE_QUESTION";
      index: number;
      question: Partial<CreateSurveyInput["questions"][number]>;
    }
  | { type: "REMOVE_QUESTION"; index: number }
  | { type: "REORDER_QUESTIONS"; fromIndex: number; toIndex: number }
  | { type: "UPDATE_CONFIG"; config: Partial<CreateSurveyInput["config"]> }
  | { type: "RESTORE_DRAFT"; draft: WizardState }
  | { type: "RESET" };

const STEPS: WizardStep[] = ["purpose", "generate", "edit", "settings", "publish"];

const STEP_LABELS: Record<WizardStep, string> = {
  purpose: "目的",
  generate: "AI 產生",
  edit: "編輯",
  settings: "設定",
  publish: "發佈",
};

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function reducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "NEXT_STEP": {
      const i = STEPS.indexOf(state.currentStep);
      return { ...state, currentStep: STEPS[Math.min(i + 1, STEPS.length - 1)]! };
    }
    case "PREV_STEP": {
      const i = STEPS.indexOf(state.currentStep);
      return { ...state, currentStep: STEPS[Math.max(i - 1, 0)]! };
    }
    case "GO_TO_STEP":
      return { ...state, currentStep: action.step };
    case "SET_TITLE":
      return { ...state, survey: { ...state.survey, title: action.title } };
    case "SET_DESCRIPTION":
      return { ...state, survey: { ...state.survey, description: action.description } };
    case "SET_PURPOSE":
      return { ...state, survey: { ...state.survey, purpose: action.purpose } };
    case "SET_TONE":
      return { ...state, survey: { ...state.survey, tone: action.tone } };
    case "SET_AUDIENCE":
      return { ...state, survey: { ...state.survey, audience: action.audience } };
    case "SET_QUESTION_COUNT":
      return { ...state, survey: { ...state.survey, questionCount: action.count } };
    case "SET_GENERATED_QUESTIONS":
      return { ...state, aiGeneratedQuestions: action.questions, isGenerating: false };
    case "SET_IS_GENERATING":
      return { ...state, isGenerating: action.isGenerating };
    case "ADD_QUESTION":
      return {
        ...state,
        survey: { ...state.survey, questions: [...state.survey.questions, action.question] },
      };
    case "UPDATE_QUESTION": {
      const questions = [...state.survey.questions];
      questions[action.index] = { ...questions[action.index]!, ...action.question };
      return { ...state, survey: { ...state.survey, questions } };
    }
    case "REMOVE_QUESTION": {
      const questions = state.survey.questions.filter((_, i) => i !== action.index);
      return { ...state, survey: { ...state.survey, questions } };
    }
    case "REORDER_QUESTIONS": {
      const questions = [...state.survey.questions];
      const [moved] = questions.splice(action.fromIndex, 1);
      questions.splice(action.toIndex, 0, moved!);
      return { ...state, survey: { ...state.survey, questions } };
    }
    case "UPDATE_CONFIG":
      return {
        ...state,
        survey: { ...state.survey, config: { ...state.survey.config, ...action.config } },
      };
    case "RESTORE_DRAFT":
      return action.draft;
    case "RESET":
      return makeInitialState();
    default:
      return state;
  }
}

function makeInitialState(draftKey?: string): WizardState {
  return {
    currentStep: "purpose",
    survey: {
      title: "",
      description: "",
      purpose: "",
      tone: "friendly",
      audience: "一般受眾",
      questionCount: 10,
      questions: [],
      config: {
        isAnonymous: false,
        showProgressBar: true,
        submitButtonText: "提交",
        successMessage: "感謝你的回應！",
      },
    },
    aiGeneratedQuestions: null,
    isGenerating: false,
    draftKey: draftKey ?? `survey-draft-${Date.now()}`,
  };
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useSurveyWizard(initialDraftKey?: string) {
  const [state, dispatch] = useReducer(reducer, makeInitialState(initialDraftKey));
  const prevRef = useRef(state);

  // Auto-save draft
  useEffect(() => {
    if (state !== prevRef.current && state.draftKey) {
      prevRef.current = state;
      try {
        localStorage.setItem(state.draftKey, JSON.stringify(state));
      } catch {
        /* ignore */
      }
    }
  }, [state]);

  // Restore draft
  useEffect(() => {
    if (!initialDraftKey) return;
    try {
      const saved = localStorage.getItem(`survey-draft-${initialDraftKey}`);
      if (saved) dispatch({ type: "RESTORE_DRAFT", draft: JSON.parse(saved) });
    } catch {
      /* ignore */
    }
  }, [initialDraftKey]);

  const currentStepIndex = STEPS.indexOf(state.currentStep);

  return {
    state,
    currentStep: state.currentStep,
    currentStepIndex,
    totalSteps: STEPS.length,
    steps: STEPS.map((id) => ({ id, label: STEP_LABELS[id] })),
    nextStep: useCallback(() => dispatch({ type: "NEXT_STEP" }), []),
    prevStep: useCallback(() => dispatch({ type: "PREV_STEP" }), []),
    goToStep: useCallback((step: WizardStep) => dispatch({ type: "GO_TO_STEP", step }), []),
    setTitle: useCallback((title: string) => dispatch({ type: "SET_TITLE", title }), []),
    setDescription: useCallback(
      (d: string) => dispatch({ type: "SET_DESCRIPTION", description: d }),
      []
    ),
    setPurpose: useCallback((p: string) => dispatch({ type: "SET_PURPOSE", purpose: p }), []),
    setTone: useCallback(
      (t: AIGenerateInput["tone"]) => dispatch({ type: "SET_TONE", tone: t }),
      []
    ),
    setAudience: useCallback((a: string) => dispatch({ type: "SET_AUDIENCE", audience: a }), []),
    setQuestionCount: useCallback(
      (n: number) => dispatch({ type: "SET_QUESTION_COUNT", count: n }),
      []
    ),
    setGeneratedQuestions: useCallback(
      (q: AIGeneratedQuestion[]) => dispatch({ type: "SET_GENERATED_QUESTIONS", questions: q }),
      []
    ),
    setIsGenerating: useCallback(
      (v: boolean) => dispatch({ type: "SET_IS_GENERATING", isGenerating: v }),
      []
    ),
    addQuestion: useCallback(
      (q: CreateSurveyInput["questions"][number]) =>
        dispatch({ type: "ADD_QUESTION", question: q }),
      []
    ),
    updateQuestion: useCallback(
      (i: number, q: Partial<CreateSurveyInput["questions"][number]>) =>
        dispatch({ type: "UPDATE_QUESTION", index: i, question: q }),
      []
    ),
    removeQuestion: useCallback((i: number) => dispatch({ type: "REMOVE_QUESTION", index: i }), []),
    reorderQuestions: useCallback(
      (from: number, to: number) =>
        dispatch({ type: "REORDER_QUESTIONS", fromIndex: from, toIndex: to }),
      []
    ),
    updateConfig: useCallback(
      (c: Partial<CreateSurveyInput["config"]>) => dispatch({ type: "UPDATE_CONFIG", config: c }),
      []
    ),
    saveDraft: useCallback(() => {
      try {
        localStorage.setItem(state.draftKey, JSON.stringify(state));
      } catch {
        /* ignore */
      }
    }, [state]),
    reset: useCallback(() => dispatch({ type: "RESET" }), []),
  };
}
