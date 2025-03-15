import { z } from 'zod';
import dayjs from 'dayjs';
import { mutations } from '../core';
import { projectTaskSchema } from './tasks';

const projectEndpoint = '/projects';

interface GetProjectMilestoneKeyProps {
  projectId: string;
  milestoneId?: number;
}

export const getProjectMilestonePathname = ({
  projectId,
  milestoneId,
}: GetProjectMilestoneKeyProps) => {
  if (milestoneId) {
    return `${projectEndpoint}/${projectId}/milestones/${milestoneId}`;
  }
  return `${projectEndpoint}/${projectId}/milestones`;
};

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

export const sortMilestones = (milestones: ProjectMilestoneSchema[]) => {
  if (!Array.isArray(milestones)) return [];

  return milestones.sort((a, b) => {
    const startDiff = dayjs(a.startDate).diff(dayjs(b.startDate), 'd');
    if (startDiff !== 0) return startDiff;
    if (a.position !== b.position) return a.position - b.position;
    return dayjs(a.endDate).diff(dayjs(b.endDate), 'd');
  });
};

export const getMilestone = (
  sortedData: ProjectMilestoneSchema[] | undefined,
  id: number
) => {
  if (!Array.isArray(sortedData)) return null;

  const index = sortedData.findIndex((milestone) => milestone.id === id);

  if (index === -1) return null;

  return {
    index,
    item: sortedData[index],
    list: sortedData,
  };
};

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

export const createProjectMilestone = ({
  projectId,
  ...request
}: CreateProjectMilestoneSchema) => {
  return mutations.post(getProjectMilestonePathname({ projectId }), request);
};

export const updateProjectMilestoneSchema = projectMilestoneSchema.omit({
  createdAt: true,
  updatedAt: true,
  isDeleted: true,
  tasks: true,
});

export type UpdateProjectMilestoneSchema = z.infer<
  typeof updateProjectMilestoneSchema
>;

export const updateProjectMilestone = ({
  projectId,
  id,
  ...request
}: UpdateProjectMilestoneSchema) => {
  return mutations.put(
    getProjectMilestonePathname({ projectId, milestoneId: id }),
    request
  );
};

export const deleteProjectMilestone = (
  projectId: string,
  milestoneId: number
) => {
  return mutations.delete(
    getProjectMilestonePathname({ projectId, milestoneId })
  );
};
