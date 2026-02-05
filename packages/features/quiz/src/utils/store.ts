import type { AnswerKeyType, IQuestion, QuizResultType } from "../types";

export const calculateQuizAnalysis = (
  result: QuizResultType,
  questionMap: Map<string, IQuestion>
) => {
  const initialScores: Record<AnswerKeyType, number> = {
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
      const answer = question?.answers.find(({ key }) => key === selectedAnswer);
      acc[selectedAnswer] += answer?.value ?? 0;
      return acc;
    },
    { ...initialScores }
  );

  // 2. Find max score and handle tie-breaking
  const maxValue = Math.max(...Object.values(scores));
  const tiedCategories = (Object.keys(scores) as AnswerKeyType[]).filter(
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

export const getResultId = (analysis: Record<AnswerKeyType, number>): AnswerKeyType => {
  // analysis 物件必定包含所有 AnswerKeyType 鍵，因此排序後直接取第一個元素的鍵
  const sorted = Object.entries(analysis).sort((a, b) => b[1] - a[1]);
  return sorted[0]![0] as AnswerKeyType;
};
