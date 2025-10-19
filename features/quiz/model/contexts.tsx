'use client';

import { useRouter } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { getQuizStorage } from '@/shared/lib/storage';
import {
  AnswerKey,
  QuizResult,
  ResultDetail,
  Theme,
  calculateQuizAnalysis,
  getResultId,
  parseQuizResult,
  isAnswerValue,
  questionMap,
  resultDetailMap,
  themeMap,
} from '@/entities/quiz';

type QuizContextType = {
  result: QuizResult;
  analysis: Record<AnswerKey, number>;
  hasAnalysis: boolean;
  detail?: ResultDetail | null;
  theme?: Theme | null;
  reset: () => void;
  selectAnswer: (questionId: string, answer: AnswerKey) => void;
};

const isQuestionId = (value: unknown): value is string =>
  questionMap.has(value as string);

export const QuizContext = createContext<QuizContextType | null>(null);

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};

export const QuizProvider = ({ children }: React.PropsWithChildren) => {
  const router = useRouter();
  const [internalResult, setInternalResult] = useState<QuizResult>({});

  const selectAnswer = useCallback(
    (questionId: string, answer: AnswerKey) => {
      if (!isQuestionId(questionId) || !isAnswerValue(answer)) {
        return;
      }
      const nextStep = parseInt(questionId.replace('q', ''), 10) + 1;
      setInternalResult((prev) => ({
        ...prev,
        [questionId]: { selectedAnswer: answer },
      }));
      if (nextStep > questionMap.size) {
        router.push('/quiz/result');
      } else {
        router.push(`/quiz/questions/q${nextStep}`);
      }
    },
    [router]
  );

  const reset = useCallback(() => {
    setInternalResult({});
    getQuizStorage().remove();
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
    const data = parseQuizResult(getQuizStorage().get(), questionMap);
    if (data) {
      setInternalResult(data);
    } else {
      getQuizStorage().remove();
    }
  }, []);

  useEffect(() => {
    getQuizStorage().set(internalResult);
  }, [internalResult]);

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
};
