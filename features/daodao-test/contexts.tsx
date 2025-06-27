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

const calculateAnalysis = (result: ResultType) => {
  const initialScores: Record<AnswerKey, number> = {
    A: 1,
    O: 1,
    L: 1,
    C: 1,
    D: 1,
  };

  if (Object.keys(result).length === 0) {
    return { ...initialScores };
  }

  // 1. Calculate raw scores
  const scores = Object.values(result).reduce(
    (acc, { selectedAnswer }, index) => {
      const question = questionMap.get(`q${index + 1}`);
      const answer = question?.answers.find(
        ({ key }) => key === selectedAnswer
      );
      acc[selectedAnswer] += answer?.value ?? 0;
      return acc;
    },
    { ...initialScores }
  );

  // 2. Find max score and handle tie-breaking
  const maxValue = Math.max(...Object.values(scores));
  const tiedCategories = (Object.keys(scores) as AnswerKey[]).filter(
    (key) => scores[key] === maxValue
  );

  if (tiedCategories.length > 1) {
    const reversedAnswers = Object.values(result).reverse();
    const lastAnswerAmongTied = reversedAnswers.find(({ selectedAnswer }) =>
      tiedCategories.includes(selectedAnswer)
    );

    if (lastAnswerAmongTied) {
      scores[lastAnswerAmongTied.selectedAnswer] += 1;
    }
  }

  return scores;
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
    [internalResult, router]
  );

  const value = useMemo(() => {
    const analysis = calculateAnalysis(internalResult);

    const resultId = Object.entries(analysis)
      .sort((a, b) => b[1] - a[1])
      .map(([key]) => key)[0]
      .toLowerCase();

    return {
      result: internalResult,
      analysis,
      hasAnalysis: questionMap.size === Object.keys(internalResult).length,
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
