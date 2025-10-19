import { AnswerKey, QuizResult, Question } from './types';

export const calculateQuizAnalysis = (
  result: QuizResult,
  questionMap: Map<string, Question>
) => {
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
  const scores = Object.entries(result).reduce(
    (acc, [questionId, { selectedAnswer }]) => {
      const question = questionMap.get(questionId);
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

export const getResultId = (analysis: Record<AnswerKey, number>): string => {
  return Object.entries(analysis)
    .sort((a, b) => b[1] - a[1])
    .map(([key]) => key)[0]
    .toLowerCase();
};
