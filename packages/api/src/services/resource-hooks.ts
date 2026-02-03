"use client";

/**
 * Resource API Hooks
 * 提供資源相關的 React Hooks（用於 Client Components）
 */

import { useMemo } from "react";
import useSWRInfinite from "swr/infinite";
import { useQuery } from "../hooks";
import { client } from "../client";
import type { IGetResourceListParams, ResourceListResponse } from "./resource";

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * 獲取資源列表的 Hook
 */
export const useResources = (params?: IGetResourceListParams) => {
  return useQuery("/api/v1/resources", {
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
 * 獲取單一資源詳情的 Hook
 */
export const useResourceById = (resourceId: string) => {
  return useQuery("/api/v1/resources/{resourceId}", {
    params: {
      path: {
        resourceId,
      },
    },
  });
};

/**
 * 獲取資源統計的 Hook
 */
export const useResourceStats = () => {
  return useQuery("/api/v1/resources/stats");
};

/**
 * 無限滾動獲取資源列表的 Hook
 */
export const useInfiniteResources = (params?: Omit<IGetResourceListParams, "cursor">) => {
  const swrInfinite = useSWRInfinite<ResourceListResponse>(
    (pageIndex, previousPageData: ResourceListResponse | null) => {
      // 如果上一頁沒有更多資料，停止請求
      if (previousPageData && !previousPageData.pagination?.hasNext) return null;

      const cursor = previousPageData?.pagination?.nextCursor;

      // 返回 key 用於 SWR 快取
      return [
        "/api/v1/resources",
        {
          ...params,
          cursor: pageIndex === 0 ? undefined : cursor,
        },
      ];
    },
    async ([, queryParams]: [string, IGetResourceListParams]) => {
      const { data } = await client.GET("/api/v1/resources", {
        params: {
          query: {
            cursor: queryParams?.cursor,
            limit: queryParams?.limit ?? "20",
            sort: queryParams?.sort,
            order: queryParams?.order,
            type: queryParams?.type,
            cost: queryParams?.cost,
            level: queryParams?.level,
            majorCategory: queryParams?.majorCategory,
            subCategory: queryParams?.subCategory,
            tags: queryParams?.tags,
            query: queryParams?.query,
            createdBy: queryParams?.createdBy,
          },
        },
      });
      return data as ResourceListResponse;
    },
    { revalidateFirstPage: false }
  );

  const data = useMemo(
    () => swrInfinite.data?.flatMap((page) => page?.data ?? []) ?? [],
    [swrInfinite.data]
  );

  // 從第一頁取得分頁資訊和 facets
  const firstPage = swrInfinite.data?.[0];
  const lastPage = swrInfinite.data?.[swrInfinite.data.length - 1];
  const hasMore = lastPage?.pagination?.hasNext ?? false;
  const totalEstimate = firstPage?.pagination?.totalEstimate ?? 0;
  const facets = firstPage?.facets;

  // 根據查詢參數從 facets 中獲取正確的分類總數
  const getTotalCountFromFacets = (): number => {
    if (!facets) return totalEstimate;

    // 如果有子分類，從 subCategory facets 中查找
    if (params?.subCategory) {
      const subCategoryFacet = facets.subCategory?.find(
        (f) => f.value === params.subCategory
      );
      if (subCategoryFacet) return subCategoryFacet.count;
    }

    // 如果只有主分類，從 majorCategory facets 中查找
    if (params?.majorCategory) {
      const majorCategoryFacet = facets.majorCategory?.find(
        (f) => f.value === params.majorCategory
      );
      if (majorCategoryFacet) return majorCategoryFacet.count;
    }

    return totalEstimate;
  };

  const totalCount = getTotalCountFromFacets();

  return {
    ...swrInfinite,
    data,
    hasMore,
    totalCount,
    facets,
    loadMore: () => swrInfinite.setSize(swrInfinite.size + 1),
  };
};
