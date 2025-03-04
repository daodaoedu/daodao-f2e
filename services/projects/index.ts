import { z } from 'zod';
import { projectMilestoneSchema } from './milestones';
import { mutations } from '../httpClient';
import { baseUserSchema } from '../users';

const projectEndpoint = '/projects';

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

export type CreateProjectRequest = z.infer<typeof createProjectSchema>;

export const createProject = (request: CreateProjectRequest) => {
  return mutations.post<ProjectSchema>(getProjectEndpoint(), request);
};

export const updateProjectSchema = projectSchema.omit({
  createdDate: true,
  updatedDate: true,
  eventId: true,
  user: true,
  milestones: true,
});

export type UpdateProjectRequest = z.infer<typeof updateProjectSchema>;

export const updateProject = ({ id, ...project }: UpdateProjectRequest) => {
  return mutations.put<ProjectSchema>(getProjectEndpoint({ id }), project);
};

export const deleteProject = (id: string) => {
  return mutations.delete(getProjectEndpoint({ id }));
};
