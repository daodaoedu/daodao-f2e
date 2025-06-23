import { useMemo } from 'react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import type { SWRConfiguration } from 'swr';

import { recommendationAPI } from './api';
import type {
  RecommendationRequestSchema,
  RecommendationResponseSchema,
  PaginatedRecommendationResponseSchema,
  RecommendationStatsSchema,
  RecommendationItem,
  RecommendationContext,
  RecommendationContentType,
} from './schema';

// ========================================
// SWR Key 生成函數 (SWR Key Generation)
// ========================================

function getRecommendationKey(params: RecommendationRequestSchema): string[] {
  return [
    'recommendations',
    params.context,
    ...(params.contentTypes || []),
    params.userId || 'anonymous',
    params.limit.toString(),
    ...(params.tags || []),
    ...(params.excludeIds || []),
  ];
}

function getPaginatedRecommendationKey(
  params: RecommendationRequestSchema & { page?: number; pageSize?: number }
): string[] {
  return [
    'recommendations-paginated',
    params.context,
    ...(params.contentTypes || []),
    params.userId || 'anonymous',
    params.limit.toString(),
    (params.page || 1).toString(),
    (params.pageSize || 20).toString(),
    ...(params.tags || []),
    ...(params.excludeIds || []),
  ];
}

function getRecommendationStatsKey(userId?: string): string[] {
  return ['recommendation-stats', userId || 'anonymous'];
}

// ========================================
// 推薦 Hooks (Recommendation Hooks)
// ========================================

/**
 * 使用推薦內容 Hook
 * @param params - 推薦請求參數
 * @param config - SWR 配置
 * @returns SWR 響應與推薦資料
 */
export function useRecommendations(
  params: RecommendationRequestSchema,
  config?: SWRConfiguration<RecommendationResponseSchema>
) {
  const swr = useSWR<RecommendationResponseSchema>(
    getRecommendationKey(params),
    () => recommendationAPI.getRecommendations(params),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1分鐘去重
      ...config,
    }
  );

  const filteredItems = useMemo<RecommendationItem[]>(() => {
    if (!swr.data?.items) return [];

    // 如果有指定內容類型過濾器，則過濾結果
    if (params.contentTypes?.length) {
      return swr.data.items.filter((item) => params.contentTypes!.includes(item.type));
    }

    return swr.data.items;
  }, [swr.data?.items, params.contentTypes]);

  return {
    ...swr,
    items: filteredItems,
    hasMore: swr.data?.hasMore || false,
    totalCount: swr.data?.totalCount || 0,
    context: swr.data?.context,
    refreshToken: swr.data?.refreshToken,
  };
}

/**
 * 使用分頁推薦內容 Hook
 * @param params - 推薦請求參數與分頁參數
 * @param config - SWR 配置
 * @returns SWR 響應與分頁推薦資料
 */
export function usePaginatedRecommendations(
  params: RecommendationRequestSchema & { page?: number; pageSize?: number },
  config?: SWRConfiguration<PaginatedRecommendationResponseSchema>
) {
  const swr = useSWR<PaginatedRecommendationResponseSchema>(
    getPaginatedRecommendationKey(params),
    () => recommendationAPI.getPaginatedRecommendations(params),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
      ...config,
    }
  );

  return {
    ...swr,
    recommendations: swr.data?.recommendations || [],
    pagination: swr.data?.pagination,
    context: swr.data?.context,
  };
}

/**
 * 使用推薦統計 Hook
 * @param userId - 使用者ID (可選)
 * @param config - SWR 配置
 * @returns SWR 響應與統計資料
 */
export function useRecommendationStats(
  userId?: string,
  config?: SWRConfiguration<RecommendationStatsSchema>
) {
  const swr = useSWR<RecommendationStatsSchema>(
    getRecommendationStatsKey(userId),
    () => recommendationAPI.getRecommendationStats(userId),
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5分鐘去重
      ...config,
    }
  );

  return {
    ...swr,
    stats: swr.data,
  };
}

/**
 * 使用推薦重新整理 Mutation Hook
 * @param options - Mutation 選項
 * @returns SWR Mutation 響應
 */
export function useRefreshRecommendations(options?: {
  onSuccess?: (data: RecommendationResponseSchema) => void;
  onError?: (error: Error) => void;
}) {
  return useSWRMutation(
    'refresh-recommendations',
    (key: string, { arg }: { arg: RecommendationRequestSchema }) =>
      recommendationAPI.refreshRecommendations(arg),
    {
      onSuccess: options?.onSuccess,
      onError: options?.onError,
    }
  );
}

// ========================================
// 特定情境的便利 Hooks (Context-Specific Convenience Hooks)
// ========================================

/**
 * 使用探索頁面推薦 Hook
 * @param contentTypes - 內容類型過濾器
 * @param options - 額外選項
 * @returns 探索推薦資料
 */
export function useExploreRecommendations(
  contentTypes?: RecommendationContentType[],
  options?: {
    userId?: string;
    tags?: string[];
    limit?: number;
  }
) {
  const params: RecommendationRequestSchema = {
    context: 'explore' as RecommendationContext,
    contentTypes,
    userId: options?.userId,
    tags: options?.tags,
    limit: options?.limit || 10,
  };

  return useRecommendations(params);
}

/**
 * 使用混合推薦內容 Hook (適用於推薦標籤)
 * @param options - 選項
 * @returns 混合推薦資料
 */
export function useMixedRecommendations(options?: {
  userId?: string;
  tags?: string[];
  limit?: number;
}) {
  const params: RecommendationRequestSchema = {
    context: 'explore' as RecommendationContext,
    // 不指定 contentTypes，獲取所有類型的混合推薦
    userId: options?.userId,
    tags: options?.tags,
    limit: options?.limit || 15,
  };

  return useRecommendations(params);
}

/**
 * 使用特定類型推薦 Hook
 * @param contentType - 內容類型
 * @param options - 選項
 * @returns 特定類型推薦資料
 */
export function useContentTypeRecommendations(
  contentType: RecommendationContentType,
  options?: {
    userId?: string;
    tags?: string[];
    limit?: number;
  }
) {
  const params: RecommendationRequestSchema = {
    context: 'explore' as RecommendationContext,
    contentTypes: [contentType],
    userId: options?.userId,
    tags: options?.tags,
    limit: options?.limit || 10,
  };

  return useRecommendations(params);
}
