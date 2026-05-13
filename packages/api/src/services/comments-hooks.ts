"use client";

/**
 * Comments API Hooks
 * 提供留言相關的 React Hooks（用於 Client Components）
 */

import { useQuery } from "../hooks";
import type { IGetCommentsParams } from "./comments";

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * 取得留言列表的 Hook
 */
export const useComments = (params: IGetCommentsParams) => {
  return useQuery("/api/v1/comments", {
    params: {
      query: {
        targetType: params.targetType,
        targetId: params.targetId,
      },
    },
  });
};

export const useMentionCandidates = (params: IGetCommentsParams & { limit?: number }) => {
  return useQuery("/api/v1/comments/mention-candidates", {
    params: {
      query: {
        targetType: params.targetType,
        targetId: params.targetId,
        limit: params.limit,
      },
    },
  });
};
