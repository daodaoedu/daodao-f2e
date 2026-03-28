"use client";

import { useEffect, useMemo, useState } from "react";
import type { CategoryType, IAction } from "../types";
import { getTagActions } from "../utils/tag-actions-map";

const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL ?? "https://worker.daodao.so";

interface UseGenerateActionsInput {
  category: CategoryType;
  topic: string;
  tags?: string[];
}

interface UseGenerateActionsReturn {
  actions: IAction[] | null;
  isLoading: boolean;
  error: Error | null;
  sessionId: string | null;
}

export function useGenerateActions(
  input: UseGenerateActionsInput | null
): UseGenerateActionsReturn {
  const tags = input?.tags;
  const category = input?.category;
  const topic = input?.topic;

  // Fast path: tag-based static lookup
  const tagActions = useMemo(() => {
    if (!tags || tags.length === 0) return null;
    return getTagActions(tags);
  }, [tags]);

  const [aiActions, setAiActions] = useState<IAction[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const needsAI = input !== null && (!tags || tags.length === 0) && !!category && !!topic;

  useEffect(() => {
    if (!needsAI || !category || !topic) return;

    const controller = new AbortController();
    let cancelled = false;

    setIsLoading(true);
    setError(null);
    setAiActions(null);

    (async () => {
      try {
        const response = await fetch(`${WORKER_URL}/action-maker/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category, topic }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Worker returned ${response.status}`);
        }

        const json = (await response.json()) as {
          success: boolean;
          data: { actions: IAction[]; session_id: string };
        };

        if (!json.success || !json.data?.actions) {
          throw new Error("Invalid response from worker");
        }

        if (!cancelled) {
          setAiActions(json.data.actions);
          setSessionId(json.data.session_id);
        }
      } catch (err) {
        if (!cancelled && !(err instanceof DOMException && err.name === "AbortError")) {
          setError(err instanceof Error ? err : new Error("Failed to generate actions"));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [needsAI, category, topic]);

  // Tag lookup takes priority; AI is for custom topics only
  const actions = tagActions ?? aiActions;

  return { actions, isLoading, error, sessionId };
}
