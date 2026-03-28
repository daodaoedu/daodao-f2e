"use client";

import { useCallback, useState } from "react";
import type { ActionLevel, CategoryType, IAction } from "../types";

const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL ?? "https://worker.daodao.so";

interface RefineInput {
  category: CategoryType;
  topic: string;
  level: ActionLevel;
  title: string;
  description?: string;
  session_id?: string;
}

interface UseRefineActionReturn {
  refinedAction: IAction | null;
  isRefining: boolean;
  refineError: Error | null;
  refine: (input: RefineInput) => Promise<void>;
  reset: () => void;
}

export function useRefineAction(): UseRefineActionReturn {
  const [refinedAction, setRefinedAction] = useState<IAction | null>(null);
  const [isRefining, setIsRefining] = useState(false);
  const [refineError, setRefineError] = useState<Error | null>(null);

  const refine = useCallback(async (input: RefineInput) => {
    setIsRefining(true);
    setRefineError(null);
    setRefinedAction(null);

    try {
      const response = await fetch(`${WORKER_URL}/action-maker/refine`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error(`Worker returned ${response.status}`);
      }

      const json = (await response.json()) as {
        success: boolean;
        data: { action: IAction; session_id: string };
      };

      if (!json.success || !json.data?.action) {
        throw new Error("Invalid response from worker");
      }

      setRefinedAction(json.data.action);
    } catch (err) {
      setRefineError(err instanceof Error ? err : new Error("Failed to refine action"));
    } finally {
      setIsRefining(false);
    }
  }, []);

  const reset = useCallback(() => {
    setRefinedAction(null);
    setRefineError(null);
  }, []);

  return { refinedAction, isRefining, refineError, refine, reset };
}
