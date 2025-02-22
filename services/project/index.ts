import { z } from 'zod';
import { Project } from '@/components/Projects/Project/type';
import { mutations } from '../httpClient';

export const projectEndpoint = '/projects';

interface GetProjectKeyProps {
  isMe?: boolean;
  id?: string;
}

export const getProjectEndpoint = ({ isMe, id }: GetProjectKeyProps = {}) => {
  if (isMe) {
    return `${projectEndpoint}/me`;
  }
  if (id) {
    return `${projectEndpoint}/${id}`;
  }
  return projectEndpoint;
};

const projectUserSchema = z.object({
  _id: z.string(),
  id: z.string(),
  name: z.string(),
  roleList: z.array(z.string()),
  photoURL: z.string(),
});

const projectTaskSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  daysOfWeek: z.array(z.string()),
  isCompleted: z.boolean(),
  milestoneId: z.number(),
});

const projectMilestoneSchema = z.object({
  id: z.number(),
  project_id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  week: z.number(),
  name: z.string(),
  description: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  isCompleted: z.boolean(),
  isDeleted: z.boolean(),
  tasks: z.array(projectTaskSchema),
});

const baseProjectSchema = z.object({
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
  user: projectUserSchema,
  milestones: z.array(projectMilestoneSchema),
});

export const createProjectSchema = baseProjectSchema.omit({
  id: true,
  createdDate: true,
  updatedDate: true,
  eventId: true,
  user: true,
  milestones: true,
});

export type CreateProjectRequest = z.infer<typeof createProjectSchema>;

export const createProject = (request: CreateProjectRequest) => {
  return mutations.post<Project>(getProjectEndpoint(), request);
};

export const updateProjectSchema = baseProjectSchema.omit({
  createdDate: true,
  updatedDate: true,
  eventId: true,
  user: true,
  milestones: true,
});

export type UpdateProjectRequest = z.infer<typeof updateProjectSchema>;

export const updateProject = ({ id, ...project }: UpdateProjectRequest) => {
  return mutations.put<Project>(getProjectEndpoint({ id }), project);
};

export const deleteProject = (id: string) => {
  return mutations.delete(getProjectEndpoint({ id }));
};
