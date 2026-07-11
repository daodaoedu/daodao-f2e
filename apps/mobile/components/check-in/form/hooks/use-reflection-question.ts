import { useState } from "react";
import { useMobileTranslation } from "@/i18n";

const REFLECTION_QUESTION_COUNT = 25;

function pickRandom(excludeIndex: number, count: number): number {
  const candidates = Array.from({ length: count }, (_, i) => i).filter((i) => i !== excludeIndex);
  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex] ?? 0;
}

/**
 * 反思提問 Hook (Mobile) — 對齊 product 的 use-reflection-question
 * 從 25 題中隨機取一題，換一題時避免重複當前題
 */
export const useReflectionQuestion = () => {
  const t = useMobileTranslation("mobile.checkIn");
  const [index, setIndex] = useState(() => Math.floor(Math.random() * REFLECTION_QUESTION_COUNT));

  const nextQuestion = () => {
    setIndex((current) => pickRandom(current, REFLECTION_QUESTION_COUNT));
  };

  return {
    question: t(`reflection_questions.${index}`),
    nextQuestion,
  };
};
