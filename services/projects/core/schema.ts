import { z } from 'zod';
import { baseUserSchema } from '../../_shared/schema';
import { projectMilestoneSchema } from '../milestones';

export const projectSchema = z.object({
  id: z.string(),
  title: z.string(),
  createdDate: z.string(),
  updatedDate: z.string(),
  description: z.string(),
  isPublic: z.boolean(),
  motivation: z.array(z.string()),
  motivationDescription: z.string(),
  goal: z.string(),
  content: z.string(),
  strategy: z.array(z.string()),
  strategyDescription: z.string(),
  resourceName: z.string().optional(),
  resourceUrl: z.array(z.string()),
  outcome: z.array(z.string()),
  outcomeDescription: z.string(),
  /** 馬拉松用的 ID */
  eventId: z.string().optional(),
  user: baseUserSchema,
  version: z.number(),
  milestones: z.array(projectMilestoneSchema),
});

export type ProjectSchema = z.infer<typeof projectSchema>;

export const createProjectSchema = projectSchema.omit({
  id: true,
  createdDate: true,
  updatedDate: true,
  eventId: true,
  user: true,
  milestones: true,
  version: true,
});

export type CreateProjectSchema = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = projectSchema.omit({
  createdDate: true,
  updatedDate: true,
  eventId: true,
  user: true,
  milestones: true,
});

export type UpdateProjectSchema = z.infer<typeof updateProjectSchema>;

export const projectMutationResponseSchema = z.object({
  success: z.boolean(),
  data: projectSchema,
  message: z.string().optional(),
});

export type ProjectMutationResponseSchema = z.infer<
  typeof projectMutationResponseSchema
>;
