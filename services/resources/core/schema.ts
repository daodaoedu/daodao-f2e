import { z } from "zod";
import { baseUserSchema } from "../../_shared/schema";
import {
  resourceReviewSchema,
  recentResourceReviewSchema,
  createResourceReviewFormSchema,
  updateResourceReviewFormSchema
} from "../reviews/schema";

// 自定義 HTTPS URL 驗證
const httpsUrl = z.string().url().refine(
  (url) => url.startsWith("https://"),
  { message: "URL 必須以 https:// 開頭" }
);

export const resourceSchema = z.object({
  id: z.number(),
  resourceName: z.string().min(1, "請輸入資源名稱"),
  resourceUrl: httpsUrl,
  resourceImgUrl: httpsUrl.optional().nullable(),
  description: z.string(),
  introVideoUrl: httpsUrl.optional().nullable(),
  resourceType: z.string(),
  targetAudience: z.string(),
  learningDuration: z.string().optional(),
  cost: z.string(),
  language: z.string(),
  status: z.string(),
  qualityScore: z.number().optional().nullable(),
  viewCount: z.number(),
  favoriteCount: z.number(),
  shareCount: z.number(),
  reviewCount: z.number(),
  avgRating: z.number().optional().nullable(),
  majorCategory: z.string(),
  subCategory: z.string(),
  user: baseUserSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  tags: z.array(z.string()),
});

export const resourceListResponseSchema = z.object({
  resources: z.array(resourceSchema),
  pagination: z.object({
    limit: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
    nextCursor: z.string().nullable(),
    prevCursor: z.string().nullable(),
    totalEstimate: z.number(),
  }),
});

export const resourceDetailResponseSchema = resourceSchema.extend({
  recentReviews: z.array(recentResourceReviewSchema).optional(),
});

export const createResourceFormSchema = z.object({
  resourceName: z.string().min(1, "請輸入資源名稱"),
  resourceUrl: httpsUrl,
  resourceImgUrl: httpsUrl.optional(),
  description: z.string().min(1, "請輸入資源描述"),
  introVideoUrl: httpsUrl.optional(),
  resourceType: z.string(),
  targetAudience: z.string(),
  learningDuration: z.string().optional(),
  cost: z.string(),
  language: z.string(),
  majorCategory: z.string(),
  subCategory: z.string(),
  tags: z.array(z.string()),
  review: createResourceReviewFormSchema.optional(),
});

export const updateResourceFormSchema = z.object({
  id: z.number(),
  resourceName: z.string().min(1, "請輸入資源名稱").optional(),
  resourceUrl: httpsUrl.optional(),
  resourceImgUrl: httpsUrl.optional(),
  description: z.string().min(1, "請輸入資源描述").optional(),
  introVideoUrl: httpsUrl.optional(),
  resourceType: z.string().optional(),
  targetAudience: z.string().optional(),
  learningDuration: z.string().optional(),
  cost: z.string().optional(),
  language: z.string().optional(),
  majorCategory: z.string().optional(),
  subCategory: z.string().optional(),
  tags: z.array(z.string()).optional(),
  review: updateResourceReviewFormSchema.optional(),
});

export const resourceMutationResponseSchema = z.object({
  resource: resourceSchema,
  review: resourceReviewSchema.optional(),
});

export const resourceSearchParamsSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().min(1).max(100).optional(),
  resourceType: z.string().optional(),
  cost: z.string().optional(),
  language: z.string().optional(),
  targetAudience: z.string().optional(),
  majorCategory: z.string().optional(),
  subCategory: z.string().optional(),
  tags: z.string().optional(),
  sort: z.enum(["createdAt", "updatedAt", "rating", "viewCount"]).optional(),
  order: z.enum(["desc", "asc"]).optional(),
  query: z.string().optional(),
});

export type ResourceSchema = z.infer<typeof resourceSchema>;

export type ResourceListResponseSchema = z.infer<
  typeof resourceListResponseSchema
>;

export type ResourceDetailResponseSchema = z.infer<
  typeof resourceDetailResponseSchema
>;

export type CreateResourceFormSchema = z.infer<typeof createResourceFormSchema>;

export type UpdateResourceFormSchema = z.infer<typeof updateResourceFormSchema>;

export type ResourceMutationResponseSchema = z.infer<
  typeof resourceMutationResponseSchema
>;

export type ResourceSearchParamsSchema = z.infer<
  typeof resourceSearchParamsSchema
>;
