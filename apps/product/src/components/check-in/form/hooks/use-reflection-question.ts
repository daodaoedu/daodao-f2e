import { useTranslations } from "@daodao/i18n";
import { useState } from "react";

const REFLECTION_QUESTION_COUNT = 25;

function pickRandom(excludeIndex: number, count: number): number {
  const candidates = Array.from({ length: count }, (_, i) => i).filter((i) => i !== excludeIndex);
  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex] ?? 0;
}

export const useReflectionQuestion = () => {
  const t = useTranslations("check_in");
  const [index, setIndex] = useState(() => Math.floor(Math.random() * REFLECTION_QUESTION_COUNT));

  const nextQuestion = () => {
    setIndex((current) => pickRandom(current, REFLECTION_QUESTION_COUNT));
  };

  return {
    question: t(`reflection_questions.${index}`),
    nextQuestion,
  };
};
