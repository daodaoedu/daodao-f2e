"use client";

/**
 * Reaction API Hooks
 * 提供快速反應相關的 React Hooks（用於 Client Components）
 */

import { useQuery } from "../hooks";
import type { IGetReactionsParams } from "./reaction";

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * 取得目標反應計數的 Hook
 */
export const useReactions = (params: IGetReactionsParams) => {
  return useQuery(
    "/api/v1/reactions",
    {
      params: {
        query: {
          targetType: params.targetType,
          targetId: params.targetId,
        },
      },
    },
    {
      refreshInterval: 30_000,
      revalidateOnFocus: true,
    },
  );
};
