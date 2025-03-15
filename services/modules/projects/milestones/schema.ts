import { z } from 'zod';
import dayjs from 'dayjs';
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

const validateDateRange = (
  startDate: string,
  endDate: string,
  ctx: z.RefinementCtx
) => {
  if (dayjs(endDate).diff(dayjs(startDate), 'day') <= 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: '時間間隔不能小於 1 天',
    });
  }
};

export const createProjectMilestoneSchema = projectMilestoneSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    isDeleted: true,
    tasks: true,
  })
  .superRefine((data, ctx) =>
    validateDateRange(data.startDate, data.endDate, ctx)
  );

export type CreateProjectMilestoneSchema = z.infer<
  typeof createProjectMilestoneSchema
>;

export const updateProjectMilestoneSchema = projectMilestoneSchema
  .omit({
    createdAt: true,
    updatedAt: true,
    isDeleted: true,
    tasks: true,
  })
  .superRefine((data, ctx) =>
    validateDateRange(data.startDate, data.endDate, ctx)
  );

export type UpdateProjectMilestoneSchema = z.infer<
  typeof updateProjectMilestoneSchema
>;
