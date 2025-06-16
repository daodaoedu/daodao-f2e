import { z } from "zod";
import { baseUserSchema, cursorsSchema } from "@/services/_shared/schema";

export const contentFeaturesSchema = z.object({
  wellStructured: z.boolean().optional(),
  practiceFocused: z.boolean().optional(),
  wellRoundedConcepts: z.boolean().optional(),
  thoughtProvoking: z.boolean().optional(),
  progressiveLearning: z.boolean().optional(),
  problemBased: z.boolean().optional(),
  realWorldExamples: z.boolean().optional(),
  interactive: z.boolean().optional(),
  visuallyRich: z.boolean().optional(),
});

export const resourceUsageSchema = z.object({
  withOnlineCourses: z.boolean().optional(),
  withBooks: z.boolean().optional(),
  withOtherTools: z.boolean().optional(),
  withCommunity: z.boolean().optional(),
  onlyThisResource: z.boolean().optional(),
  notApplicableResource: z.boolean().optional(),
});

export const resourceReviewSchema = z.object({
  id: z.number(),
  content: z.string().min(1, "請輸入心得內容"),
  overallImpact: z.number().min(0.5).max(5),
  changeMindset: z.number().min(0.5).max(5),
  solveProblems: z.number().min(0.5).max(5),
  gainPerspectives: z.number().min(0.5).max(5),
  achieveGoals: z.number().min(0.5).max(5),
  avgRating: z.number(),
  timeUsage: z.string(),
  contentFeatures: contentFeaturesSchema.optional(),
  resourceUsage: resourceUsageSchema.optional(),
  status: z.string(),
  likesCount: z.number(),
  helpfulCount: z.number().optional(),
  user: baseUserSchema,
  resourceId: z.number(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
});

// 用於資源詳情頁面顯示的簡化評論結構
export const recentResourceReviewSchema = resourceReviewSchema.pick({
  id: true,
  content: true,
  avgRating: true,
  status: true,
  likesCount: true,
  helpfulCount: true,
  user: true,
  resourceId: true,
  createdAt: true,
  updatedAt: true,
});

export const resourceReviewListResponseSchema = z.object({
  reviews: z.array(resourceReviewSchema),
  pagination: cursorsSchema,
});

export const resourceReviewFormSchema = resourceReviewSchema.pick({
  content: true,
  overallImpact: true,
  changeMindset: true,
  solveProblems: true,
  gainPerspectives: true,
  achieveGoals: true,
  timeUsage: true,
  contentFeatures: true,
  resourceUsage: true,
});

export const resourceReviewResponseSchema = z.object({
  review: resourceReviewSchema,
});

export type ResourceReviewSchema = z.infer<typeof resourceReviewSchema>;

export type ResourceReviewListResponseSchema = z.infer<
  typeof resourceReviewListResponseSchema
>;

export type ResourceReviewFormSchema = z.infer<typeof resourceReviewFormSchema>;

export type ResourceReviewResponseSchema = z.infer<
  typeof resourceReviewResponseSchema
>;

export type ContentFeaturesSchema = z.infer<typeof contentFeaturesSchema>;

export type ResourceUsageSchema = z.infer<typeof resourceUsageSchema>;

export type RecentResourceReviewSchema = z.infer<
  typeof recentResourceReviewSchema
>;
