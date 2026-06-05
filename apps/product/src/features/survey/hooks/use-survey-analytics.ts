"use client";

import { useCallback, useEffect, useState } from "react";
import { generateAnalytics, getAnalytics } from "../services/survey";
import type { SurveyAnalytics } from "../types";

export function useSurveyAnalytics(surveyId: string) {
  const [analytics, setAnalytics] = useState<SurveyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!surveyId) return;
    setLoading(true);
    getAnalytics(surveyId)
      .then(setAnalytics)
      .catch((e: Error) => setError(e.message ?? "載入失敗"))
      .finally(() => setLoading(false));
  }, [surveyId]);

  const regenerate = useCallback(async () => {
    setGenerating(true);
    try {
      const result = await generateAnalytics(surveyId);
      setAnalytics(result);
    } catch (e) {
      setError((e as Error).message ?? "生成失敗");
    } finally {
      setGenerating(false);
    }
  }, [surveyId]);

  return { analytics, loading, generating, error, regenerate };
}
