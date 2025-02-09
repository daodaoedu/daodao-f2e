import { z } from 'zod';
import { mutations } from '../httpClient';

export const projectEndpoint = '/projects';

interface GetProjectKeyProps {
  isMe?: boolean;
  projectId?: string;
}

export const getProjectEndpoint = ({
  isMe,
  projectId,
}: GetProjectKeyProps = {}) => {
  if (isMe) {
    return `${projectEndpoint}/me`;
  }
  if (projectId) {
    return `${projectEndpoint}/${projectId}`;
  }
  return projectEndpoint;
};

const baseProjectSchema = z.object({
  title: z.string(),
  description: z.string(),
  updatedDate: z.string(),
  isPublic: z.boolean(),
  motivation: z.array(z.string()),
  motivationDescription: z.string(),
  goal: z.string(),
  content: z.string(),
  strategy: z.array(z.string()),
  strategyDescription: z.string(),
  resourceName: z.array(z.string()),
  resourceUrl: z.array(z.string()),
  outcome: z.array(z.string()),
  outcomeDescription: z.string(),
});

const createProjectSchema = baseProjectSchema;

export type CreateProjectRequest = z.infer<typeof createProjectSchema>;

export const createProject = ({ ...project }: CreateProjectRequest) => {
  return mutations.post(getProjectEndpoint(), project);
};

const updateProjectSchema = baseProjectSchema.extend({
  projectId: z.string(),
});

export type UpdateProjectRequest = z.infer<typeof updateProjectSchema>;

export const updateProject = ({
  projectId,
  ...project
}: UpdateProjectRequest) => {
  return mutations.put(getProjectEndpoint({ projectId }), project);
};

export const deleteProject = (projectId: string) => {
  return mutations.delete(getProjectEndpoint({ projectId }));
};
