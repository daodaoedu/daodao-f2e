"use client";

import { useCallback, useState } from "react";
import { generateSurveyQuestions } from "../services/survey";
import type { AIGeneratedQuestion, AIGenerateInput } from "../types";

export function useSurveyGenerate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (input: AIGenerateInput): Promise<AIGeneratedQuestion[]> => {
    setLoading(true);
    setError(null);
    try {
      const res = await generateSurveyQuestions(input);
      if (!res.success) throw new Error(res.error ?? "生成失敗");
      return res.data.questions;
    } catch (e) {
      const msg = (e as Error).message ?? "生成失敗";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { generate, loading, error };
}
