import { z } from "zod";
import { baseUserSchema } from "../../_shared/schema";

export const resourceReviewExperienceDataSchema = z.object({
  contentFeatures: z.array(z.string()),
  timeUsage: z.string(),
  suitableFor: z.array(z.string()),
  timeInvested: z.string(),
  learningMethod: z.string(),
  difficultyLevel: z.string(),
});

export const resourceReviewSchema = z.object({
  id: z.number(),
  title: z.string().min(1, "請輸入心得標題"),
  content: z.string().min(1, "請輸入心得內容"),
  overallImpact: z.number().min(1).max(5),
  changeMindset: z.number().min(1).max(5),
  solveProblems: z.number().min(1).max(5),
  gainPerspectives: z.number().min(1).max(5),
  achieveGoals: z.number().min(1).max(5),
  avgRating: z.number(),
  experienceData: resourceReviewExperienceDataSchema,
  status: z.string(),
  likesCount: z.number(),
  helpfulCount: z.number().optional(),
  user: baseUserSchema,
  resourceId: z.number(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  tags: z.array(z.string()),
});

// 用於資源詳情頁面顯示的簡化評論結構
export const recentResourceReviewSchema = z.object({
  id: z.number(),
  title: z.string(),
  avgRating: z.number(),
  likesCount: z.number(),
  status: z.string(),
  createdAt: z.string().datetime(),
  user: baseUserSchema,
});

export const resourceReviewListResponseSchema = z.object({
  reviews: z.array(resourceReviewSchema),
  pagination: z.object({
    limit: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
    nextCursor: z.string().nullable(),
    prevCursor: z.string().nullable(),
    totalEstimate: z.number(),
  }),
});

export const createResourceReviewFormSchema = z.object({
  title: z.string().min(1, "請輸入心得標題"),
  content: z.string().min(1, "請輸入心得內容"),
  overallImpact: z.number().min(1).max(5),
  changeMindset: z.number().min(1).max(5),
  solveProblems: z.number().min(1).max(5),
  gainPerspectives: z.number().min(1).max(5),
  achieveGoals: z.number().min(1).max(5),
  experienceData: resourceReviewExperienceDataSchema,
  tags: z.array(z.string()),
});

export const updateResourceReviewFormSchema = z.object({
  title: z.string().min(1, "請輸入心得標題").optional(),
  content: z.string().min(1, "請輸入心得內容").optional(),
  overallImpact: z.number().min(1).max(5).optional(),
  changeMindset: z.number().min(1).max(5).optional(),
  solveProblems: z.number().min(1).max(5).optional(),
  gainPerspectives: z.number().min(1).max(5).optional(),
  achieveGoals: z.number().min(1).max(5).optional(),
  experienceData: resourceReviewExperienceDataSchema.optional(),
  tags: z.array(z.string()).optional(),
});

export const resourceReviewResponseSchema = z.object({
  review: resourceReviewSchema,
});

export const resourceReviewSearchParamsSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().min(1).max(100).optional(),
  sort: z.enum(["createdAt", "updatedAt", "rating", "viewCount"]).optional(),
  order: z.enum(["desc", "asc"]).optional(),
});

export type ResourceReviewSchema = z.infer<typeof resourceReviewSchema>;
export type ResourceReviewListResponseSchema = z.infer<typeof resourceReviewListResponseSchema>;
export type CreateResourceReviewFormSchema = z.infer<typeof createResourceReviewFormSchema>;
export type UpdateResourceReviewFormSchema = z.infer<typeof updateResourceReviewFormSchema>;
export type ResourceReviewResponseSchema = z.infer<typeof resourceReviewResponseSchema>;
export type ResourceReviewSearchParamsSchema = z.infer<typeof resourceReviewSearchParamsSchema>;
export type ResourceReviewExperienceDataSchema = z.infer<typeof resourceReviewExperienceDataSchema>;
export type RecentResourceReviewSchema = z.infer<typeof recentResourceReviewSchema>;
