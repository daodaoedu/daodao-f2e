import { z } from 'zod';
import { projectTaskSchema } from '../tasks';

export const projectMilestoneSchema = z.object({
  id: z.number(),
  projectId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  position: z
    .number()
    .optional()
    .transform((val) =>
      typeof val === 'number' && Number.isInteger(val) && val > 0 ? val : 1000
    ),
  name: z.string().min(1, '請輸入名稱'),
  startDate: z.string(),
  endDate: z.string(),
  isCompleted: z.boolean(),
  isDeleted: z.boolean(),
  tasks: z.array(projectTaskSchema),
});

export type ProjectMilestoneSchema = z.infer<typeof projectMilestoneSchema>;

export const createProjectMilestoneSchema = projectMilestoneSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isDeleted: true,
  tasks: true,
});

export type CreateProjectMilestoneSchema = z.infer<
  typeof createProjectMilestoneSchema
>;

export const updateProjectMilestoneSchema = projectMilestoneSchema.omit({
  createdAt: true,
  updatedAt: true,
  isDeleted: true,
  tasks: true,
});

export type UpdateProjectMilestoneSchema = z.infer<
  typeof updateProjectMilestoneSchema
>;
