import { z } from 'zod';

export const projectTaskSchema = z.object({
  id: z.number(),
  name: z.string().min(1, '請輸入名稱'),
  daysOfWeek: z.array(z.string()),
  isCompleted: z.boolean(),
  milestoneId: z.number(),
  projectId: z.string(),
  position: z
    .number()
    .optional()
    .transform((val) =>
      typeof val === 'number' && Number.isInteger(val) && val > 0 ? val : 1000
    ),
});

export type ProjectTaskSchema = z.infer<typeof projectTaskSchema>;

export const createProjectTaskSchema = projectTaskSchema.omit({
  id: true,
});

export type CreateProjectTaskSchema = z.infer<typeof createProjectTaskSchema>;

export const updateProjectTaskSchema = projectTaskSchema;

export type UpdateProjectTaskSchema = z.infer<typeof updateProjectTaskSchema>;

export const deleteProjectTaskSchema = projectTaskSchema.pick({
  id: true,
  milestoneId: true,
  projectId: true,
});

export type DeleteProjectTaskSchema = z.infer<typeof deleteProjectTaskSchema>;
