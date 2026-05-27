"use client"

import { useCallback, useEffect, useState } from "react"
import { getSurveyByShareId, submitResponse } from "../services/survey"
import type { SurveyWithQuestions, SurveyResponse } from "../types"
import type { SubmitResponseInput } from "../schema"

export function useSurveyResponse(shareId: string) {
  const [survey, setSurvey] = useState<SurveyWithQuestions | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!shareId) return
    setLoading(true)
    getSurveyByShareId(shareId)
      .then(setSurvey)
      .catch((e: Error) => setError(e.message ?? "載入失敗"))
      .finally(() => setLoading(false))
  }, [shareId])

  const submit = useCallback(
    (payload: SubmitResponseInput) => submitResponse(payload),
    []
  )

  return { survey, loading, error, submitResponse: submit }
}
