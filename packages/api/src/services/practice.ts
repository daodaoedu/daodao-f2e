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

export type IGetPracticeTemplatesParams = NonNullable<
  paths["/api/v1/practices/templates"]["get"]["parameters"]["query"]
>;

export type IGetRandomPracticeTemplatesParams = NonNullable<
  paths["/api/v1/practices/templates/random"]["get"]["parameters"]["query"]
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

/**
 * 獲取實踐模板列表
 */
export const getPracticeTemplates = async (params?: IGetPracticeTemplatesParams) => {
  return client.GET("/api/v1/practices/templates", {
    params: {
      query: {
        page: params?.page,
        limit: params?.limit,
        category: params?.category,
        search: params?.search,
      },
    },
  });
};

/**
 * 獲取實踐模板分類列表
 */
export const getPracticeTemplateCategories = async () => {
  return client.GET("/api/v1/practices/templates/categories");
};

/**
 * 獲取單一實踐模板詳情
 */
export const getPracticeTemplateById = async (id: string) => {
  return client.GET("/api/v1/practices/templates/{id}", {
    params: {
      path: {
        id,
      },
    },
  });
};

/**
 * 隨機獲取實踐模板
 */
export const getRandomPracticeTemplates = async (params?: IGetRandomPracticeTemplatesParams) => {
  return client.GET("/api/v1/practices/templates/random", {
    params: {
      query: {
        count: params?.count,
        category: params?.category,
      },
    },
  });
};

// ============================================================================
// Export Types
// ============================================================================

type PracticeTemplatesResponse =
  paths["/api/v1/practices/templates"]["get"]["responses"]["200"]["content"]["application/json"];

type PracticeTemplateCategoriesResponse =
  paths["/api/v1/practices/templates/categories"]["get"]["responses"]["200"]["content"]["application/json"];

// 從回應中提取 PracticeTemplateType 類型（單一模板項目的數據類型）
export type PracticeTemplateType = NonNullable<PracticeTemplatesResponse["data"]>[number];

export type { PracticeListResponse, PracticeStatsResponse, PracticeTemplatesResponse, PracticeTemplateCategoriesResponse };
