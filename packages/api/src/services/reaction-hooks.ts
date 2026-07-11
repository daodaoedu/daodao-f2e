"use client";

/**
 * Reaction API Hooks
 * 提供快速反應相關的 React Hooks（用於 Client Components）
 */

import { useMemo } from "react";
import useSWR from "swr";
import { useQuery } from "../hooks";
import type { IGetReactionsBatchParams, IGetReactionsParams } from "./reaction";
import { getReactionsBatch } from "./reaction";

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * 取得目標反應計數的 Hook
 * @param enabled - 設為 false 時不發請求（用於有預取資料的場景）
 *
 * init 必須 memoize：swr-openapi key 用 reference 比較，每次 new object 會無限 revalidate
 */
export const useReactions = (params: IGetReactionsParams, options?: { enabled?: boolean }) => {
  const enabled = options?.enabled ?? true;
  const { targetType, targetId } = params;
  const init = useMemo(
    () =>
      enabled
        ? {
            params: {
              query: {
                targetType,
                targetId,
              },
            },
          }
        : null,
    [enabled, targetType, targetId]
  );
  return useQuery("/api/v1/reactions", init, {
    refreshInterval: 30_000,
    revalidateOnFocus: true,
  });
};

/**
 * 取得目標個別用戶反應列表的 Hook
 * @param enabled - 設為 false 時不發請求（用於有預取資料的場景）
 */
export const useReactionsList = (
  params: IGetReactionsParams,
  options?: { enabled?: boolean }
) => {
  const enabled = options?.enabled ?? true;
  const { targetType, targetId } = params;
  const init = useMemo(
    () =>
      enabled
        ? {
            params: {
              query: {
                targetType,
                targetId,
              },
            },
          }
        : null,
    [enabled, targetType, targetId]
  );
  return useQuery("/api/v1/reactions/list", init, {
    refreshInterval: 30_000,
    revalidateOnFocus: true,
  });
};

/**
 * 批次取得多個目標的反應計數 + 用戶反應列表
 */
export const useReactionsBatch = (params: IGetReactionsBatchParams) => {
  const sortedIds = [...params.targetIds].sort().join(",");

  return useSWR(
    params.targetIds.length > 0 ? ["/api/v1/reactions/batch", params.targetType, sortedIds] : null,
    () => getReactionsBatch(params),
    {
      refreshInterval: 30_000,
      revalidateOnFocus: true,
    }
  );
};
