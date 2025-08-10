import { AnswerKey, questionMap } from './constants/questionMap';

export type ResultType = Record<string, { selectedAnswer: AnswerKey }>;

const answerValueSet = new Set<AnswerKey>(['L', 'C', 'A', 'D', 'O']);

export const isAnswerValue = (value: unknown): value is AnswerKey => answerValueSet.has(value as AnswerKey);

export const isQuestionId = (value: unknown): value is string => questionMap.has(value as string);

export const parseResult = (value: unknown): ResultType | null => {
  if (typeof value !== 'object' || value == null) {
    return null;
  }
  return Object.entries(value).reduce((acc, [key, answer]) => {
    if (isQuestionId(key) && isAnswerValue(answer?.selectedAnswer)) {
      acc[key] = { selectedAnswer: answer.selectedAnswer };
    }
    return acc;
  }, {} as ResultType);
};
