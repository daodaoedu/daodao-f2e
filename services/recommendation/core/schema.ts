import { z } from 'zod';
import { baseUserSchema, paginationSchema } from '@/services/_shared/schema';

// ========================================
// 推薦內容類型 (Recommendation Content Types)
// ========================================

export const recommendationContentTypeSchema = z.enum([
  'idea',
  'practice',
  'project',
  'resource'
]);

export type RecommendationContentType = z.infer<typeof recommendationContentTypeSchema>;

// ========================================
// 推薦情境類型 (Recommendation Context Types)
// ========================================

export const recommendationContextSchema = z.enum([
  'explore', // 探索頁面
  'social', // 社交頁面
  'resource' // 資源頁面
]);

export type RecommendationContext = z.infer<typeof recommendationContextSchema>;

// ========================================
// 基礎推薦項目 Schema (Base Recommendation Item Schema)
// ========================================

// 想法推薦項目
export const ideaRecommendationItemSchema = z.object({
  id: z.string(),
  type: z.literal('idea'),
  content: z.string(),
  user: baseUserSchema,
  tags: z.array(z.string()),
  likeCount: z.number(),
  commentCount: z.number(),
  createdDate: z.string(),
  score: z.number(), // 推薦分數
  reason: z.string().optional(), // 推薦原因
});

// 實踐推薦項目
export const practiceRecommendationItemSchema = z.object({
  id: z.string(),
  type: z.literal('practice'),
  title: z.string(),
  description: z.string(),
  user: baseUserSchema,
  tags: z.array(z.string()),
  participants: z.number(),
  category: z.string(),
  status: z.string(),
  createdDate: z.string(),
  score: z.number(),
  reason: z.string().optional(),
});

// 計劃推薦項目
export const projectRecommendationItemSchema = z.object({
  id: z.string(),
  type: z.literal('project'),
  title: z.string(),
  description: z.string(),
  user: baseUserSchema,
  tags: z.array(z.string()),
  participants: z.number(),
  status: z.string(),
  createdDate: z.string(),
  score: z.number(),
  reason: z.string().optional(),
});

// 資源推薦項目
export const resourceRecommendationItemSchema = z.object({
  id: z.string(),
  type: z.literal('resource'),
  title: z.string(),
  description: z.string(),
  user: baseUserSchema,
  tags: z.array(z.string()),
  categories: z.array(z.string()),
  viewCount: z.number(),
  createdDate: z.string(),
  score: z.number(),
  reason: z.string().optional(),
});

// 聯合推薦項目 Schema
export const recommendationItemSchema = z.discriminatedUnion('type', [
  ideaRecommendationItemSchema,
  practiceRecommendationItemSchema,
  projectRecommendationItemSchema,
  resourceRecommendationItemSchema,
]);

export type RecommendationItem = z.infer<typeof recommendationItemSchema>;

// ========================================
// API 請求參數 Schema (API Request Parameters)
// ========================================

// 推薦請求參數
export const recommendationRequestSchema = z.object({
  context: recommendationContextSchema,
  contentTypes: z.array(recommendationContentTypeSchema).optional(),
  userId: z.string().optional(),
  excludeIds: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  limit: z.number().min(1).max(50).default(10),
});

export type RecommendationRequestSchema = z.infer<typeof recommendationRequestSchema>;

// ========================================
// API 響應 Schema (API Response Schema)
// ========================================

// 推薦響應
export const recommendationResponseSchema = z.object({
  items: z.array(recommendationItemSchema),
  context: recommendationContextSchema,
  totalCount: z.number(),
  hasMore: z.boolean(),
  refreshToken: z.string().optional(), // 用於重新整理推薦
});

export type RecommendationResponseSchema = z.infer<typeof recommendationResponseSchema>;

// ========================================
// 分頁推薦響應 Schema (Paginated Recommendation Response)
// ========================================

export const paginatedRecommendationResponseSchema = z.object({
  recommendations: z.array(recommendationItemSchema),
  pagination: paginationSchema,
  context: recommendationContextSchema,
});

export type PaginatedRecommendationResponseSchema = z.infer<typeof paginatedRecommendationResponseSchema>;

// ========================================
// 推薦統計 Schema (Recommendation Statistics)
// ========================================

export const recommendationStatsSchema = z.object({
  totalRecommendations: z.number(),
  byContentType: z.record(recommendationContentTypeSchema, z.number()),
  averageScore: z.number(),
  lastUpdated: z.string(),
});

export type RecommendationStatsSchema = z.infer<typeof recommendationStatsSchema>;
