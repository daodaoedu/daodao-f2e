"use client";

import { createPractice } from "@daodao/api";
import { useCallback, useState } from "react";
import type { IActionMakerResult } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://server.daodao.so";

interface UseCreatePracticeReturn {
  isCreating: boolean;
  createError: Error | null;
  createPracticeFromResult: (
    result: IActionMakerResult,
    sessionId: string | null,
    usedRefine: boolean
  ) => Promise<{ practiceId: string } | null>;
}

export function useCreatePracticeFromAction(): UseCreatePracticeReturn {
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<Error | null>(null);

  const createPracticeFromResult = useCallback(
    async (result: IActionMakerResult, sessionId: string | null, usedRefine: boolean) => {
      setIsCreating(true);
      setCreateError(null);

      try {
        // Extract custom text from triggerTiming (exclude known period labels)
        const knownLabels = new Set(["早餐前", "通勤時", "午休時", "晚餐後", "睡前"]);
        const customContext = result.triggerTiming
          .split("、")
          .filter((p) => !knownLabels.has(p))
          .join("、");

        const { data, error } = await createPractice({
          title: result.action.title ?? "",
          practiceAction: result.action.description ?? undefined,
          otherContext: customContext || undefined,
          tags: [result.category],
          practiceTimePeriods: result.triggerTimingPeriods,
          startDate: new Date().toISOString().split("T")[0],
          durationDays: 14,
          frequencyMinDays: 1,
          frequencyMaxDays: 1,
          isDraft: false,
          creationMethod: "action_generator",
        });

        if (error || !data) {
          throw new Error("Failed to create practice");
        }

        // openapi-fetch returns { data: { success, data: PracticeEntity } }
        const practiceId = data.data?.id;

        // Report interaction (non-blocking)
        if (sessionId) {
          // Uses credentials: "include" to send auth cookie.
          // daodao-server authenticate middleware supports both Cookie and Bearer token auth.
          fetch(`${API_URL}/api/v1/ai-generations/${sessionId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              user_interaction: {
                selected_action_id: result.action.id,
                selected_level: result.action.level,
                used_refine: usedRefine,
                created_practice_id: practiceId ?? undefined,
                completed_flow: true,
              },
            }),
          }).catch(() => {});
        }

        return practiceId ? { practiceId: String(practiceId) } : null;
      } catch (err) {
        setCreateError(err instanceof Error ? err : new Error("Failed to create practice"));
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    []
  );

  return { isCreating, createError, createPracticeFromResult };
}
