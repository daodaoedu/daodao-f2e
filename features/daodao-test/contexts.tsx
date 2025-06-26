import { useRouter } from "next/router";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getDaodaoTestStorage } from "@/utils/storage";
import {
  AnswerKey,
  questionMap,
  resultDetailMap,
  ResultDetailType,
  themeMap,
  ThemeType,
} from "./constants";
import { isAnswerValue, isQuestionId, parseResult, ResultType } from "./utils";

type DaodaoTestContextType = {
  result: ResultType;
  analysis: Record<AnswerKey, number>;
  hasAnalysis: boolean;
  detail?: ResultDetailType | null;
  theme?: ThemeType | null;
  reset: () => void;
  selectAnswer: (questionId: string, answer: AnswerKey) => void;
};

export const DaodaoTestContext = createContext<DaodaoTestContextType | null>(
  null
);

export const useDaodaoTest = () => {
  const context = useContext(DaodaoTestContext);
  if (!context) {
    throw new Error("useDaodaoTest must be used within a DaodaoTestProvider");
  }
  return context;
};

export const DaodaoTestProvider = ({ children }: React.PropsWithChildren) => {
  const router = useRouter();
  const [internalResult, setInternalResult] = useState<ResultType>({});

  const selectAnswer = useCallback(
    (questionId: string, answer: AnswerKey) => {
      if (!isQuestionId(questionId) || !isAnswerValue(answer)) {
        return;
      }
      const nextStep = parseInt(questionId.slice(1), 10) + 1;
      const newResult = {
        ...internalResult,
        [questionId]: { selectedAnswer: answer },
      };
      setInternalResult(newResult);
      if (nextStep > questionMap.size) {
        router.push("/daodao-test/result");
      } else {
        router.push(`/daodao-test/questions/q${nextStep}`);
      }
    },
    [internalResult, router.push]
  );

  const value = useMemo(() => {
    const analysis = Object.values(internalResult).reduce(
      (acc, { selectedAnswer }, index) => {
        const question = questionMap.get(`q${index + 1}`);
        const answer = question?.answers.find(
          ({ key }) => key === selectedAnswer
        );
        acc[selectedAnswer] += answer?.value ?? 0;
        return acc;
      },
      { A: 0, O: 0, L: 0, C: 0, D: 0 }
    );

    const resultId = Object.entries(analysis)
      .sort((a, b) => b[1] - a[1])
      .map(([key]) => key)[0]
      .toLowerCase();

    return {
      result: internalResult,
      analysis,
      hasAnalysis: Object.values(analysis).some((v) => v > 0),
      detail: resultDetailMap.get(resultId),
      theme: themeMap.get(resultId),
      reset: () => {
        setInternalResult({});
        getDaodaoTestStorage().remove();
      },
      selectAnswer,
    };
  }, [internalResult, selectAnswer]);

  useEffect(() => {
    const data = parseResult(getDaodaoTestStorage().get());
    if (data) {
      setInternalResult(data);
    } else {
      getDaodaoTestStorage().remove();
    }
  }, []);

  useEffect(() => {
    getDaodaoTestStorage().set(internalResult);
  }, [internalResult]);

  return (
    <DaodaoTestContext.Provider value={value}>
      {children}
    </DaodaoTestContext.Provider>
  );
};
