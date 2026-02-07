/**
 * Resource API Service
 * 提供資源相關的 API 調用函數（用於 Server Components 或直接調用）
 */

import { client } from "../client";
import type { components, paths } from "../types";

// ============================================================================
// Types
// ============================================================================

type ResourceListResponse =
  paths["/api/v1/resources"]["get"]["responses"]["200"]["content"]["application/json"];
type ResourceDetailResponse =
  paths["/api/v1/resources/{resourceId}"]["get"]["responses"]["200"]["content"]["application/json"];
type ResourceStatsResponse =
  paths["/api/v1/resources/stats"]["get"]["responses"]["200"]["content"]["application/json"];

export type IGetResourceListParams = NonNullable<
  paths["/api/v1/resources"]["get"]["parameters"]["query"]
>;

export type ResourceData = components["schemas"]["ResourceData"];
export type ResourceStats = components["schemas"]["ResourceStats"];

export type { ResourceListResponse, ResourceDetailResponse, ResourceStatsResponse };

// ============================================================================
// Client Functions (用於 Server Components 或直接調用)
// ============================================================================

/**
 * 獲取資源列表
 */
export const getResources = async (params?: IGetResourceListParams) => {
  return client.GET("/api/v1/resources", {
    params: {
      query: {
        cursor: params?.cursor,
        limit: params?.limit,
        sort: params?.sort,
        order: params?.order,
        type: params?.type,
        cost: params?.cost,
        level: params?.level,
        majorCategory: params?.majorCategory,
        subCategory: params?.subCategory,
        tags: params?.tags,
        query: params?.query,
        createdBy: params?.createdBy,
      },
    },
  });
};

/**
 * 獲取單一資源詳情
 */
export const getResourceById = async (resourceId: string) => {
  return client.GET("/api/v1/resources/{resourceId}", {
    params: {
      path: {
        resourceId,
      },
    },
  });
};

/**
 * 獲取資源統計
 */
export const getResourceStats = async () => {
  return client.GET("/api/v1/resources/stats");
};
