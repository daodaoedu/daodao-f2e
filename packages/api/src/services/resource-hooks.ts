"use client";

/**
 * Resource API Hooks
 * 提供資源相關的 React Hooks（用於 Client Components）
 */

import { useQuery } from "../hooks";
import type { IGetResourceListParams } from "./resource";

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * 根據 resourceId 獲取資源資訊的 Hook
 */
export const useResourceById = (resourceId: string | null) => {
  return useQuery(
    "/api/v1/resources/{resourceId}",
    resourceId ? { params: { path: { resourceId } } } : null
  );
};

/**
 * 獲取資源列表的 Hook
 */
export const useResourceList = (params?: IGetResourceListParams) => {
  return useQuery("/api/v1/resources", {
    params: {
      query: {
        cursor: params?.cursor ?? undefined,
      },
    },
  });
};
