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
  overallImpact: z.number().min(1).max(5),
  changeMindset: z.number().min(1).max(5),
  solveProblems: z.number().min(1).max(5),
  gainPerspectives: z.number().min(1).max(5),
  achieveGoals: z.number().min(1).max(5),
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
  tags: z.array(z.string()),
});

// 用於資源詳情頁面顯示的簡化評論結構
export const recentResourceReviewSchema = resourceReviewSchema.omit({
  overallImpact: true,
  changeMindset: true,
  solveProblems: true,
  gainPerspectives: true,
  achieveGoals: true,
  contentFeatures: true,
  resourceUsage: true,
  timeUsage: true,
});

export const resourceReviewListResponseSchema = z.object({
  reviews: z.array(resourceReviewSchema),
  pagination: cursorsSchema,
});

export const createResourceReviewFormSchema = z.object({
  content: z.string().min(1, "請輸入心得內容"),
  overallImpact: z.number().min(1).max(5),
  changeMindset: z.number().min(1).max(5),
  solveProblems: z.number().min(1).max(5),
  gainPerspectives: z.number().min(1).max(5),
  achieveGoals: z.number().min(1).max(5),
  timeUsage: z.string(),
  contentFeatures: contentFeaturesSchema,
  resourceUsage: resourceUsageSchema,
  tags: z.array(z.string()),
});

export const updateResourceReviewFormSchema =
  createResourceReviewFormSchema.partial();

export const resourceReviewResponseSchema = z.object({
  review: resourceReviewSchema,
});

export type ResourceReviewSchema = z.infer<typeof resourceReviewSchema>;

export type ResourceReviewListResponseSchema = z.infer<
  typeof resourceReviewListResponseSchema
>;

export type CreateResourceReviewFormSchema = z.infer<
  typeof createResourceReviewFormSchema
>;
export type UpdateResourceReviewFormSchema = z.infer<
  typeof updateResourceReviewFormSchema
>;
export type ResourceReviewResponseSchema = z.infer<
  typeof resourceReviewResponseSchema
>;

export type ContentFeaturesSchema = z.infer<typeof contentFeaturesSchema>;

export type ResourceUsageSchema = z.infer<typeof resourceUsageSchema>;

export type RecentResourceReviewSchema = z.infer<
  typeof recentResourceReviewSchema
>;
