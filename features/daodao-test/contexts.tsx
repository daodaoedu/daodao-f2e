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
  AnswerValue,
  isAnswerValue,
  isQuestionId,
  parseResult,
  ResultType,
} from "./constants";

type DaodaoTestContextType = {
  result: ResultType;
  selectAnswer: (questionId: string, answer: AnswerValue) => void;
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
  const [internalResult, setInternalResult] = useState<ResultType>({});

  useEffect(() => {
    const data = parseResult(getDaodaoTestStorage().get());
    if (JSON.stringify(internalResult) !== JSON.stringify(data)) {
      setInternalResult(data);
    }
  }, [internalResult]);

  const selectAnswer = useCallback(
    (questionId: string, answer: AnswerValue) => {
      if (!isQuestionId(questionId) || !isAnswerValue(answer)) {
        return;
      }
      const newResult = {
        ...internalResult,
        [questionId]: { selectedAnswer: answer },
      };
      setInternalResult(newResult);
      getDaodaoTestStorage().set(newResult);
    },
    [internalResult]
  );

  const value = useMemo(
    () => ({ result: internalResult, selectAnswer }),
    [internalResult, selectAnswer]
  );

  return (
    <DaodaoTestContext.Provider value={value}>
      {children}
    </DaodaoTestContext.Provider>
  );
};
