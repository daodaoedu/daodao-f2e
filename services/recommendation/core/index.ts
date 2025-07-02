// ========================================
// 推薦服務核心模組導出 (Recommendation Service Core Module Exports)
// ========================================

// API 導出
export { recommendationAPI } from './api';
export type { RecommendationAPI } from './api';

// Schema 和類型導出
export type {
  RecommendationContentType,
  RecommendationContext,
  RecommendationItem,
  RecommendationRequestSchema,
  RecommendationResponseSchema,
  PaginatedRecommendationResponseSchema,
  RecommendationStatsSchema,
} from './schema';

export {
  recommendationContentTypeSchema,
  recommendationContextSchema,
  recommendationItemSchema,
  ideaRecommendationItemSchema,
  practiceRecommendationItemSchema,
  projectRecommendationItemSchema,
  resourceRecommendationItemSchema,
  recommendationRequestSchema,
  recommendationResponseSchema,
  paginatedRecommendationResponseSchema,
  recommendationStatsSchema,
} from './schema';

// Hooks 導出
export {
  useRecommendations,
  usePaginatedRecommendations,
  useRecommendationStats,
  useRefreshRecommendations,
  useExploreRecommendations,
  useMixedRecommendations,
  useContentTypeRecommendations,
} from './hooks';
