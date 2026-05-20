import { useTranslations } from "@daodao/i18n";
import { useState } from "react";

const REFLECTION_QUESTION_KEYS = [
  "reflection_q1",
  "reflection_q2",
  "reflection_q3",
  "reflection_q4",
  "reflection_q5",
  "reflection_q6",
  "reflection_q7",
  "reflection_q8",
  "reflection_q9",
  "reflection_q10",
  "reflection_q11",
  "reflection_q12",
  "reflection_q13",
  "reflection_q14",
  "reflection_q15",
  "reflection_q16",
  "reflection_q17",
  "reflection_q18",
  "reflection_q19",
  "reflection_q20",
  "reflection_q21",
  "reflection_q22",
  "reflection_q23",
  "reflection_q24",
  "reflection_q25",
] as const;

function pickRandom(excludeIndex: number): number {
  const candidates = REFLECTION_QUESTION_KEYS.map((_, i) => i).filter((i) => i !== excludeIndex);
  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex] ?? 0;
}

export const useReflectionQuestion = () => {
  const t = useTranslations("check_in");
  const [index, setIndex] = useState(() =>
    Math.floor(Math.random() * REFLECTION_QUESTION_KEYS.length)
  );

  const nextQuestion = () => {
    setIndex((current) => pickRandom(current));
  };

  const key = REFLECTION_QUESTION_KEYS[index] ?? REFLECTION_QUESTION_KEYS[0];

  return {
    question: key ? t(key) : "",
    nextQuestion,
  };
};
