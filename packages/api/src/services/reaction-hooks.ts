"use client";

/**
 * Reaction API Hooks
 * 提供快速反應相關的 React Hooks（用於 Client Components）
 */

import useSWR from "swr";
import { useQuery } from "../hooks";
import type { IGetReactionsParams, IGetReactionsBatchParams } from "./reaction";
import { getReactionsBatch } from "./reaction";

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * 取得目標反應計數的 Hook
 * @param enabled - 設為 false 時不發請求（用於有預取資料的場景）
 */
export const useReactions = (
  params: IGetReactionsParams,
  options?: { enabled?: boolean },
) => {
  const enabled = options?.enabled ?? true;
  return useQuery(
    "/api/v1/reactions",
    enabled
      ? {
          params: {
            query: {
              targetType: params.targetType,
              targetId: params.targetId,
            },
          },
        }
      : null,
    {
      refreshInterval: 30_000,
      revalidateOnFocus: true,
    },
  );
};

/**
 * 取得目標個別用戶反應列表的 Hook
 */
/**
 * 取得目標個別用戶反應列表的 Hook
 * @param enabled - 設為 false 時不發請求（用於有預取資料的場景）
 */
export const useReactionsList = (
  params: IGetReactionsParams,
  options?: { enabled?: boolean },
) => {
  const enabled = options?.enabled ?? true;
  return useQuery(
    "/api/v1/reactions/list",
    enabled
      ? {
          params: {
            query: {
              targetType: params.targetType,
              targetId: params.targetId,
            },
          },
        }
      : null,
    {
      refreshInterval: 30_000,
      revalidateOnFocus: true,
    },
  );
};

/**
 * 批次取得多個目標的反應計數 + 用戶反應列表
 */
export const useReactionsBatch = (params: IGetReactionsBatchParams) => {
  const sortedIds = [...params.targetIds].sort().join(",");

  return useSWR(
    params.targetIds.length > 0
      ? ["/api/v1/reactions/batch", params.targetType, sortedIds]
      : null,
    () => getReactionsBatch(params),
    {
      refreshInterval: 30_000,
      revalidateOnFocus: true,
    },
  );
};
