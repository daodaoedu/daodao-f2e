import { z } from 'zod';
import { mutations } from '../httpClient';
import { projectEndpoint } from './index';

interface GetProjectOutcomeEndpointOptions {
  projectId: string;
  outcomeId?: number;
}

export const getProjectOutcomeEndpoint = ({
  projectId,
  outcomeId,
}: GetProjectOutcomeEndpointOptions) => {
  if (outcomeId) {
    return `${projectEndpoint}/${projectId}/outcomes/${outcomeId}`;
  }
  return `${projectEndpoint}/${projectId}/outcomes`;
};

const projectOutcomeSchema = z.object({
  id: z.number(),
  projectId: z.string(),
  title: z.string(),
  week: z.number(),
  date: z.string().date(),
  description: z.string(),
  img_url: z.string().nullable(),
});

export type ProjectOutcomeSchema = z.infer<typeof projectOutcomeSchema>;

export const createProjectOutcomeSchema = projectOutcomeSchema.omit({
  id: true,
});

export type CreateProjectOutcomeRequest = z.infer<
  typeof createProjectOutcomeSchema
>;

export const createProjectOutcome = ({
  projectId,
  ...outcome
}: CreateProjectOutcomeRequest) => {
  return mutations.post(getProjectOutcomeEndpoint({ projectId }), outcome);
};

export const updateProjectOutcomeSchema = projectOutcomeSchema;

export type UpdateProjectOutcomeRequest = z.infer<
  typeof updateProjectOutcomeSchema
>;

export const updateProjectOutcome = ({
  projectId,
  id,
  ...outcome
}: UpdateProjectOutcomeRequest) => {
  return mutations.put(
    getProjectOutcomeEndpoint({ projectId, outcomeId: id }),
    outcome
  );
};

export const deleteProjectOutcome = (projectId: string, outcomeId: number) => {
  return mutations.delete(getProjectOutcomeEndpoint({ projectId, outcomeId }));
};
