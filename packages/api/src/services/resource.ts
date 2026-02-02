/**
 * Resource API Service
 * 提供資源相關的 API 調用函數（用於 Server Components 或直接調用）
 */

import { client, getSwrKeyWithResponse } from "../client";
import type { paths } from "../types";

// ============================================================================
// Types
// ============================================================================

type ResourceResponse =
  paths["/api/v1/resources/{resourceId}"]["get"]["responses"]["200"]["content"]["application/json"];
type ResourceListResponse =
  paths["/api/v1/resources"]["get"]["responses"]["200"]["content"]["application/json"];

export interface IGetResourceListParams {
  cursor?: string | null;
}

// ============================================================================
// Client Functions (用於 Server Components 或直接調用)
// ============================================================================

/**
 * 根據 resourceId 獲取資源資訊
 */
export const getResourceById = async (resourceId: string) => {
  return client.GET("/api/v1/resources/{resourceId}", {
    params: {
      path: { resourceId },
    },
  });
};

/**
 * 獲取資源列表
 */
export const getResourceList = async (params?: IGetResourceListParams) => {
  return client.GET("/api/v1/resources", {
    params: {
      query: {
        cursor: params?.cursor ?? undefined,
      },
    },
  });
};

/**
 * 獲取單一 Resource 資料（包含 SWR key，用於 Server Components）
 */
export const getResourceData = async (resourceId: string) => {
  return getSwrKeyWithResponse("/api/v1/resources/{resourceId}", {
    params: { path: { resourceId } },
  });
};

/**
 * 獲取 Resource 列表資料（包含 SWR key，用於 Server Components）
 */
export const getResourceListData = async (params?: IGetResourceListParams) => {
  return getSwrKeyWithResponse("/api/v1/resources", {
    params: {
      query: {
        cursor: params?.cursor ?? undefined,
      },
    },
  });
};

// ============================================================================
// Export Types
// ============================================================================

export type { ResourceResponse, ResourceListResponse };
