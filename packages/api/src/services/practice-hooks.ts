"use client";

/**
 * Practice API Hooks
 * 提供實踐相關的 React Hooks（用於 Client Components）
 */

import { useQuery } from "../hooks";
import type { IGetMyPracticesParams, IGetPracticeStatsParams } from "./practice";

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * 獲取當前用戶實踐列表的 Hook
 */
export const useMyPractices = (params?: IGetMyPracticesParams) => {
  return useQuery("/api/v1/me/practices", {
    params: {
      query: {
        page: params?.page,
        limit: params?.limit,
        status: params?.status,
        search: params?.search,
        sortBy: params?.sortBy,
        sortOrder: params?.sortOrder,
        dateFrom: params?.dateFrom,
        dateTo: params?.dateTo,
      },
    },
  });
};

/**
 * 獲取當前用戶實踐統計的 Hook
 */
export const useMyPracticeStats = (params?: IGetPracticeStatsParams) => {
  return useQuery("/api/v1/me/practice-stats", {
    params: {
      query: {
        timeRange: params?.timeRange,
        includeArchived: params?.includeArchived ?? undefined,
      },
    },
  });
};