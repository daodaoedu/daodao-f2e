import { z } from 'zod';
import { mutations } from '../core';
import { updateImage } from '../images';

const projectEndpoint = '/projects';

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
  content: z.string(),
  imgUrls: z.array(z.string()).nullable(),
  imgFiles: z.array(z.instanceof(File)).nullable().optional(),
  videoUrls: z.array(z.string()).nullable().optional(),
});

export type ProjectOutcomeSchema = z.infer<typeof projectOutcomeSchema>;

export const createProjectOutcomeSchema = projectOutcomeSchema.omit({
  id: true,
});

export type CreateProjectOutcomeRequest = z.infer<
  typeof createProjectOutcomeSchema
>;

export const createProjectOutcome = async ({
  projectId,
  imgFiles,
  imgUrls,
  ...outcome
}: CreateProjectOutcomeRequest) => {
  const updatedImgUrls = await updateImage(imgFiles, imgUrls);

  return mutations.post(getProjectOutcomeEndpoint({ projectId }), {
    ...outcome,
    imgUrls: updatedImgUrls,
  });
};

export const updateProjectOutcomeSchema = projectOutcomeSchema;

export type UpdateProjectOutcomeRequest = z.infer<
  typeof updateProjectOutcomeSchema
>;

export const updateProjectOutcome = async ({
  projectId,
  id,
  imgFiles,
  imgUrls,
  ...outcome
}: UpdateProjectOutcomeRequest) => {
  const updatedImgUrls = await updateImage(imgFiles, imgUrls);

  return mutations.put(
    getProjectOutcomeEndpoint({ projectId, outcomeId: id }),
    {
      ...outcome,
      imgUrls: updatedImgUrls,
    }
  );
};

export const deleteProjectOutcome = (projectId: string, outcomeId: number) => {
  return mutations.delete(getProjectOutcomeEndpoint({ projectId, outcomeId }));
};
