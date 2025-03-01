import { z } from 'zod';
import { mutations } from '../httpClient';

const projectEndpoint = '/projects';

interface GetProjectMilestoneKeyProps {
  projectId: string;
  milestoneId?: number;
}

export const getProjectMilestoneEndpoint = ({
  projectId,
  milestoneId,
}: GetProjectMilestoneKeyProps) => {
  if (milestoneId) {
    return `${projectEndpoint}/${projectId}/milestones/${milestoneId}`;
  }
  return `${projectEndpoint}/${projectId}/milestones`;
};

const projectTaskSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  daysOfWeek: z.array(z.string()),
  isCompleted: z.boolean(),
  milestoneId: z.number(),
});

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
  description: z.string(),
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

export type CreateProjectMilestoneRequest = z.infer<
  typeof createProjectMilestoneSchema
>;

export const createProjectMilestone = ({
  projectId,
  ...request
}: CreateProjectMilestoneRequest) => {
  return mutations.post(
    getProjectMilestoneEndpoint({ projectId }),
    request
  );
};

export const updateProjectMilestoneSchema = projectMilestoneSchema.omit({
  createdAt: true,
  updatedAt: true,
  isDeleted: true,
  tasks: true,
});

export type UpdateProjectMilestoneRequest = z.infer<
  typeof updateProjectMilestoneSchema
>;

export const updateProjectMilestone = ({
  projectId,
  id,
  ...request
}: UpdateProjectMilestoneRequest) => {
  return mutations.put(
    getProjectMilestoneEndpoint({ projectId, milestoneId: id }),
    request
  );
};

export const deleteProjectMilestone = (
  projectId: string,
  milestoneId: number
) => {
  return mutations.delete(
    getProjectMilestoneEndpoint({ projectId, milestoneId })
  );
};
