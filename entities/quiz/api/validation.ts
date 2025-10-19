import { AnswerKey, QuizResult } from '../model';

const answerValueSet = new Set<AnswerKey>(['L', 'C', 'A', 'D', 'O']);

export const isAnswerValue = (value: unknown): value is AnswerKey => 
  answerValueSet.has(value as AnswerKey);

export const isQuestionId = (value: unknown, questionMap: Map<string, any>): value is string => 
  questionMap.has(value as string);

export const parseQuizResult = (value: unknown, questionMap: Map<string, any>): QuizResult | null => {
  if (typeof value !== 'object' || value == null) {
    return null;
  }
  
  return Object.entries(value).reduce((acc, [key, answer]) => {
    if (isQuestionId(key, questionMap) && isAnswerValue((answer as any)?.selectedAnswer)) {
      acc[key] = { selectedAnswer: (answer as any).selectedAnswer };
    }
    return acc;
  }, {} as QuizResult);
};
