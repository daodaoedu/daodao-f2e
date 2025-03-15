import { z } from 'zod';
import { mutations } from '../core';

const projectEndpoint = '/projects';

interface GetProjectMilestoneKeyProps {
  projectId: string;
  milestoneId: number;
  taskId?: number;
}

export const getProjectTaskPathname = ({
  projectId,
  milestoneId,
  taskId,
}: GetProjectMilestoneKeyProps) => {
  if (taskId) {
    return `${projectEndpoint}/${projectId}/milestones/${milestoneId}/tasks/${taskId}`;
  }
  return `${projectEndpoint}/${projectId}/milestones/${milestoneId}/tasks`;
};

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

export const sortTasks = (tasks: ProjectTaskSchema[]) => {
  if (!Array.isArray(tasks)) return [];

  return tasks.sort((a, b) => a.position - b.position);
};

export const getTask = (sortedData: ProjectTaskSchema[], id: number) => {
  if (!Array.isArray(sortedData)) return null;

  const index = sortedData.findIndex((task) => task.id === id);

  if (index === -1) return null;

  return {
    index,
    item: sortedData[index],
    list: sortedData,
  };
};

export const createProjectTaskSchema = projectTaskSchema.omit({
  id: true,
});

export type CreateProjectTaskSchema = z.infer<typeof createProjectTaskSchema>;

export const createProjectTask = ({
  projectId,
  milestoneId,
  ...request
}: CreateProjectTaskSchema) => {
  return mutations.post(
    getProjectTaskPathname({ projectId, milestoneId }),
    request
  );
};

export const updateProjectTaskSchema = projectTaskSchema;

export type UpdateProjectTaskSchema = z.infer<typeof updateProjectTaskSchema>;

export const updateProjectTask = ({
  projectId,
  milestoneId,
  id,
  ...request
}: UpdateProjectTaskSchema) => {
  return mutations.put(
    getProjectTaskPathname({ projectId, milestoneId, taskId: id }),
    request
  );
};

export const deleteProjectTaskSchema = projectTaskSchema.pick({
  id: true,
  milestoneId: true,
  projectId: true,
});

export type DeleteProjectTaskSchema = z.infer<typeof deleteProjectTaskSchema>;

export const deleteProjectTask = ({
  id,
  projectId,
  milestoneId,
}: DeleteProjectTaskSchema) => {
  return mutations.delete(
    getProjectTaskPathname({ projectId, milestoneId, taskId: id })
  );
};
