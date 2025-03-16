import { z } from 'zod';

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

export type ProjectReviewSchema = z.infer<typeof projectReviewSchema>;

export const createProjectReviewSchema = projectReviewSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateProjectReviewSchema = z.infer<
  typeof createProjectReviewSchema
>;

export const updateProjectReviewSchema = projectReviewSchema.omit({
  createdAt: true,
  updatedAt: true,
});

export type UpdateProjectReviewSchema = z.infer<
  typeof updateProjectReviewSchema
>;
