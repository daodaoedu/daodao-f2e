"use client";

/**
 * Practice API Hooks
 * 提供實踐相關的 React Hooks（用於 Client Components）
 */

import { client } from "../client";
import { useQuery } from "../hooks";
import type {
  IGetMyPracticesParams,
  IGetPracticeStatsParams,
  IGetPracticeTemplatesParams,
  IGetRandomPracticeTemplatesParams,
  IGetPracticeCheckInsParams,
} from "./practice";
import type { components, paths } from "../types";

// ============================================================================
// Types
// ============================================================================

export type CreatePracticeRequestType = components["schemas"]["CreatePracticeRequest"];

type UpdatePracticeRequestBody = paths["/api/v1/practices/{id}"]["put"]["requestBody"];
export type UpdatePracticeRequestType = UpdatePracticeRequestBody extends {
  content: { "application/json": infer T };
}
  ? T
  : never;

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

/**
 * 獲取實踐模板列表的 Hook
 */
export const usePracticeTemplates = (params?: IGetPracticeTemplatesParams) => {
  return useQuery("/api/v1/practices/templates", {
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
 * 獲取實踐模板分類列表的 Hook
 */
export const usePracticeTemplateCategories = () => {
  return useQuery("/api/v1/practices/templates/categories");
};

/**
 * 獲取單一實踐模板詳情的 Hook
 */
export const usePracticeTemplateById = (id: string) => {
  return useQuery("/api/v1/practices/templates/{id}", {
    params: {
      path: {
        id,
      },
    },
  });
};

/**
 * 隨機獲取實踐模板的 Hook
 */
export const useRandomPracticeTemplates = (params?: IGetRandomPracticeTemplatesParams) => {
  return useQuery("/api/v1/practices/templates/random", {
    params: {
      query: {
        count: params?.count,
        category: params?.category,
      },
    },
  });
};

/**
 * 獲取單一實踐詳情的 Hook
 */
export const usePracticeById = (id: string) => {
  return useQuery("/api/v1/practices/{id}", {
    params: {
      path: {
        id,
      },
    },
  });
};

/**
 * 獲取實踐打卡記錄列表的 Hook
 */
export const usePracticeCheckIns = (
  id: string,
  params?: IGetPracticeCheckInsParams
) => {
  return useQuery("/api/v1/practices/{id}/checkins", {
    params: {
      path: {
        id,
      },
      query: {
        page: params?.page,
        limit: params?.limit,
        startDate: params?.startDate,
        endDate: params?.endDate,
        mood: params?.mood,
        include: params?.include,
      },
    },
  });
};

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * 建立實踐的函數（用於 Client Components）
 */
export const createPractice = async (data: CreatePracticeRequestType) => {
  return client.POST("/api/v1/practices", {
    body: data,
  });
};

/**
 * 更新實踐的函數（用於 Client Components）
 */
export const updatePractice = async (id: string, data: UpdatePracticeRequestType) => {
  return client.PUT("/api/v1/practices/{id}", {
    params: {
      path: {
        id,
      },
    },
    body: data,
  });
};