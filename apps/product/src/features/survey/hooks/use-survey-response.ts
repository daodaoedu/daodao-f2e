"use client";

import { useCallback, useEffect, useState } from "react";
import type { SubmitResponseInput } from "../schema";
import { getSurveyByShareId, submitResponse } from "../services/survey";
import type { SurveyWithQuestions } from "../types";

export function useSurveyResponse(shareId: string) {
  const [survey, setSurvey] = useState<SurveyWithQuestions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [reload, setReload] = useState(0);
  useEffect(() => {
    if (!shareId) return;
    let active = true;
    void reload;
    setLoading(true);
    setError(null);
    getSurveyByShareId(shareId)
      .then((data) => {
        if (active) setSurvey(data);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [shareId, reload]);
  const submit = useCallback((payload: SubmitResponseInput) => submitResponse(payload), []);
  const retry = useCallback(() => setReload((value) => value + 1), []);
  return {
    survey: survey?.shareId === shareId ? survey : null,
    loading,
    error,
    submitResponse: submit,
    retry,
  };
}
