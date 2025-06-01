import { z } from "zod";

const projectReviewSchema = z.object({
  id: z.number(),
  projectId: z.string().uuid(),
  title: z.string(),
  week: z.number(),
  mood: z.string(),
  moodDescription: z.string(),
  stressLevel: z.number(),
  learningReview: z.number(),
  learningFeedback: z.string(),
  adjustmentPlan: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const projectReviewFormSchema = projectReviewSchema.omit({
  id: true,
  projectId: true,
  createdAt: true,
  updatedAt: true,
});

export type ProjectReviewSchema = z.infer<typeof projectReviewSchema>;
export type ProjectReviewFormSchema = z.infer<typeof projectReviewFormSchema>;
