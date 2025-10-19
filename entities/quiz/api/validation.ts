import { AnswerKey, Question, QuizResult } from '../model';

const answerValueSet = new Set<AnswerKey>(['L', 'C', 'A', 'D', 'O']);

export const isAnswerValue = (value: unknown): value is AnswerKey =>
  answerValueSet.has(value as AnswerKey);

export const isQuestionId = (
  value: unknown,
  questionMap: Map<string, Question>
): value is string => questionMap.has(value as string);

export const parseQuizResult = (
  value: unknown,
  questionMap: Map<string, Question>
): QuizResult | null => {
  if (typeof value !== 'object' || value == null) {
    return null;
  }

  return Object.entries(value).reduce(
    (acc, [key, answer]: [string, QuizResult[string] | undefined]) => {
      if (
        isQuestionId(key, questionMap) &&
        isAnswerValue(answer?.selectedAnswer)
      ) {
        acc[key] = { selectedAnswer: answer.selectedAnswer };
      }
      return acc;
    },
    {} as QuizResult
  );
};
