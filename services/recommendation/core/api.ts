import { fetcher } from '@/shared/lib/http';
import type {
  RecommendationRequestSchema,
  RecommendationResponseSchema,
  PaginatedRecommendationResponseSchema,
  RecommendationStatsSchema,
} from './schema';

// ========================================
// API 路徑生成函數 (API Path Generation)
// ========================================

function getRecommendationPathname(endpoint: string = ''): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  return `${baseUrl}/api/recommendations${endpoint}`;
}

// ========================================
// 推薦 API 介面 (Recommendation API Interface)
// ========================================

export interface RecommendationAPI {
  /**
   * 獲取推薦內容
   * @param params - 推薦請求參數
   * @returns 推薦響應
   */
  getRecommendations: (params: RecommendationRequestSchema) => Promise<RecommendationResponseSchema>;

  /**
   * 獲取分頁推薦內容
   * @param params - 推薦請求參數與分頁參數
   * @returns 分頁推薦響應
   */
  getPaginatedRecommendations: (params: RecommendationRequestSchema & {
    page?: number;
    pageSize?: number;
  }) => Promise<PaginatedRecommendationResponseSchema>;

  /**
   * 獲取推薦統計資料
   * @param userId - 使用者ID (可選)
   * @returns 推薦統計
   */
  getRecommendationStats: (userId?: string) => Promise<RecommendationStatsSchema>;

  /**
   * 重新整理推薦內容
   * @param params - 推薦請求參數
   * @returns 新的推薦響應
   */
  refreshRecommendations: (params: RecommendationRequestSchema) => Promise<RecommendationResponseSchema>;
}

// ========================================
// API 實作 (API Implementation)
// ========================================

export const recommendationAPI: RecommendationAPI = {
  /**
   * 獲取推薦內容
   */
  getRecommendations: async (params: RecommendationRequestSchema): Promise<RecommendationResponseSchema> => {
    const searchParams = new URLSearchParams();

    // 構建查詢參數
    searchParams.append('context', params.context);
    if (params.contentTypes?.length) {
      searchParams.append('contentTypes', params.contentTypes.join(','));
    }
    if (params.userId) {
      searchParams.append('userId', params.userId);
    }
    if (params.excludeIds?.length) {
      searchParams.append('excludeIds', params.excludeIds.join(','));
    }
    if (params.tags?.length) {
      searchParams.append('tags', params.tags.join(','));
    }
    searchParams.append('limit', params.limit.toString());

    return fetcher(getRecommendationPathname(`?${searchParams.toString()}`));
  },

  /**
   * 獲取分頁推薦內容
   */
  getPaginatedRecommendations: async (
    params: RecommendationRequestSchema & { page?: number; pageSize?: number }
  ): Promise<PaginatedRecommendationResponseSchema> => {
    const searchParams = new URLSearchParams();

    // 構建查詢參數
    searchParams.append('context', params.context);
    if (params.contentTypes?.length) {
      searchParams.append('contentTypes', params.contentTypes.join(','));
    }
    if (params.userId) {
      searchParams.append('userId', params.userId);
    }
    if (params.excludeIds?.length) {
      searchParams.append('excludeIds', params.excludeIds.join(','));
    }
    if (params.tags?.length) {
      searchParams.append('tags', params.tags.join(','));
    }
    searchParams.append('limit', params.limit.toString());
    searchParams.append('page', (params.page || 1).toString());
    searchParams.append('pageSize', (params.pageSize || 20).toString());

    return fetcher(getRecommendationPathname(`/paginated?${searchParams.toString()}`));
  },

  /**
   * 獲取推薦統計資料
   */
  getRecommendationStats: async (userId?: string): Promise<RecommendationStatsSchema> => {
    const searchParams = new URLSearchParams();
    if (userId) {
      searchParams.append('userId', userId);
    }

    return fetcher(getRecommendationPathname(`/stats?${searchParams.toString()}`));
  },

  /**
   * 重新整理推薦內容
   */
  refreshRecommendations: async (params: RecommendationRequestSchema): Promise<RecommendationResponseSchema> => {
    const searchParams = new URLSearchParams();

    // 構建查詢參數
    searchParams.append('context', params.context);
    if (params.contentTypes?.length) {
      searchParams.append('contentTypes', params.contentTypes.join(','));
    }
    if (params.userId) {
      searchParams.append('userId', params.userId);
    }
    if (params.excludeIds?.length) {
      searchParams.append('excludeIds', params.excludeIds.join(','));
    }
    if (params.tags?.length) {
      searchParams.append('tags', params.tags.join(','));
    }
    searchParams.append('limit', params.limit.toString());
    searchParams.append('refresh', 'true');

    return fetcher(getRecommendationPathname(`/refresh?${searchParams.toString()}`));
  },
};

// 預設導出
export default recommendationAPI;
