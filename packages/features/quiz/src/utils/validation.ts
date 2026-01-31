import type { AnswerKeyType, IQuestion, QuizResultType } from "../types";

const answerValueSet = new Set<AnswerKeyType>(["L", "C", "A", "D", "O"]);

export const isAnswerValue = (value: unknown): value is AnswerKeyType =>
  answerValueSet.has(value as AnswerKeyType);

export const isQuestionId = (
  value: unknown,
  questionMap: Map<string, IQuestion>
): value is string => questionMap.has(value as string);

export const parseQuizResult = (
  value: unknown,
  questionMap: Map<string, IQuestion>
): QuizResultType | null => {
  if (typeof value !== "object" || value == null) {
    return null;
  }

  return Object.entries(value).reduce(
    (acc, [key, answer]: [string, QuizResultType[string] | undefined]) => {
      if (isQuestionId(key, questionMap) && isAnswerValue(answer?.selectedAnswer)) {
        acc[key] = { selectedAnswer: answer.selectedAnswer };
      }
      return acc;
    },
    {} as QuizResultType
  );
};
