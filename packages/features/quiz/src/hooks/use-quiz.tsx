import { useContext } from "react";
import { QuizContext } from "../providers/quiz-provider";

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error("useQuiz must be used within a QuizProvider");
  }
  return context;
};
