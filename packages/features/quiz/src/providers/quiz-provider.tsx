"use client";

import { useRouter } from "@daodao/i18n/navigation";
import { getStorage, StorageEnum } from "@daodao/shared";
import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import type { AnswerKeyType, IResultDetail, ITheme, QuizResultType } from "../types";
import { questionMap } from "../utils/question-map";
import { resultDetailMap } from "../utils/result-detail-map";
import { calculateQuizAnalysis, getResultId } from "../utils/store";
import { themeMap } from "../utils/theme-map";
import { isAnswerValue, parseQuizResult } from "../utils/validation";

type QuizContextType = {
  result: QuizResultType;
  analysis: Record<AnswerKeyType, number>;
  hasAnalysis: boolean;
  detail?: IResultDetail | null;
  theme?: ITheme | null;
  reset: () => void;
  selectAnswer: (questionId: string, answer: AnswerKeyType) => void;
};

const isQuestionId = (value: unknown): value is string => questionMap.has(value as string);

export const QuizContext = createContext<QuizContextType | null>(null);

export const QuizProvider = ({ children }: React.PropsWithChildren) => {
  const router = useRouter();
  const [internalResult, setInternalResult] = useState<QuizResultType>({});

  const selectAnswer = useCallback(
    (questionId: string, answer: AnswerKeyType) => {
      if (!isQuestionId(questionId) || !isAnswerValue(answer)) {
        return;
      }
      const nextStep = Number.parseInt(questionId.replace("q", ""), 10) + 1;
      setInternalResult((prev) => ({
        ...prev,
        [questionId]: { selectedAnswer: answer },
      }));
      if (nextStep > questionMap.size) {
        router.push("/quiz/result");
      } else {
        router.push(`/quiz/questions/q${nextStep}`);
      }
    },
    [router]
  );

  const reset = useCallback(() => {
    setInternalResult({});
    getStorage(StorageEnum.Quiz).remove();
  }, []);

  const value = useMemo(() => {
    const analysis = calculateQuizAnalysis(internalResult, questionMap);
    const resultId = getResultId(analysis);

    return {
      result: internalResult,
      analysis,
      hasAnalysis: questionMap.size === Object.keys(internalResult).length,
      detail: resultDetailMap.get(resultId),
      theme: themeMap.get(resultId),
      reset,
      selectAnswer,
    };
  }, [internalResult, reset, selectAnswer]);

  useEffect(() => {
    const data = parseQuizResult(getStorage(StorageEnum.Quiz).get(), questionMap);
    if (data) {
      setInternalResult(data);
    } else {
      getStorage(StorageEnum.Quiz).remove();
    }
  }, []);

  useEffect(() => {
    getStorage(StorageEnum.Quiz).set(internalResult);
  }, [internalResult]);

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
};
