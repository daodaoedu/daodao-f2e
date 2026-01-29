/**
 * Practice API Service
 * 提供實踐相關的 API 調用函數（用於 Server Components 或直接調用）
 */

import { client } from "../client";
import type { paths } from "../types";

// ============================================================================
// Types
// ============================================================================

type PracticeListResponse =
  paths["/api/v1/me/practices"]["get"]["responses"]["200"]["content"]["application/json"];
type PracticeStatsResponse =
  paths["/api/v1/me/practice-stats"]["get"]["responses"]["200"]["content"]["application/json"];

export type IGetMyPracticesParams = NonNullable<
  paths["/api/v1/me/practices"]["get"]["parameters"]["query"]
>;

export type IGetPracticeStatsParams = NonNullable<
  paths["/api/v1/me/practice-stats"]["get"]["parameters"]["query"]
>;

// ============================================================================
// Client Functions (用於 Server Components 或直接調用)
// ============================================================================

/**
 * 獲取當前用戶的實踐列表
 */
export const getMyPractices = async (params?: IGetMyPracticesParams) => {
  return client.GET("/api/v1/me/practices", {
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
 * 獲取當前用戶的實踐統計
 */
export const getMyPracticeStats = async (params?: IGetPracticeStatsParams) => {
  return client.GET("/api/v1/me/practice-stats", {
    params: {
      query: {
        timeRange: params?.timeRange,
        includeArchived: params?.includeArchived ?? undefined,
      },
    },
  });
};

// ============================================================================
// Export Types
// ============================================================================

export type { PracticeListResponse, PracticeStatsResponse };
