import { z } from 'zod';
import { mutations } from '../core';

const projectEndpoint = '/projects';

interface GetProjectReviewListKeyOptions {
  projectId: string;
  reviewId?: number;
}

export const getProjectReviewEndpoint = ({
  projectId,
  reviewId,
}: GetProjectReviewListKeyOptions) => {
  if (reviewId) {
    return `${projectEndpoint}/${projectId}/reviews/${reviewId}`;
  }
  return `${projectEndpoint}/${projectId}/reviews`;
};

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

export type CreateProjectReviewRequest = z.infer<
  typeof createProjectReviewSchema
>;

export const createProjectReview = ({
  projectId,
  ...review
}: CreateProjectReviewRequest) => {
  return mutations.post<ProjectReviewSchema>(
    getProjectReviewEndpoint({ projectId }),
    review
  );
};

export const updateProjectReviewSchema = projectReviewSchema.omit({
  createdAt: true,
  updatedAt: true,
});

export type UpdateProjectReviewRequest = z.infer<
  typeof updateProjectReviewSchema
>;

export const updateProjectReview = ({
  projectId,
  id,
  ...review
}: UpdateProjectReviewRequest) => {
  return mutations.put<ProjectReviewSchema>(
    getProjectReviewEndpoint({ projectId, reviewId: id }),
    review
  );
};

export const deleteProjectReview = (projectId: string, reviewId: number) => {
  return mutations.delete(getProjectReviewEndpoint({ projectId, reviewId }));
};
