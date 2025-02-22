import { z } from 'zod';
import { mutations } from '../httpClient';
import { uploadImage } from '../images';

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
  videoUrls: z.array(z.string()).nullable(),
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
  ...outcome
}: CreateProjectOutcomeRequest) => {
  const newUrls: string[] = [];

  if (Array.isArray(imgFiles) && imgFiles.length > 0) {
    const { url } = await uploadImage({ file: imgFiles[0] });
    newUrls.push(url);
  }

  return mutations.post(getProjectOutcomeEndpoint({ projectId }), {
    ...outcome,
    imgUrls: newUrls,
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
  ...outcome
}: UpdateProjectOutcomeRequest) => {
  const newUrls: string[] = [];

  if (Array.isArray(imgFiles) && imgFiles.length > 0) {
    const { url } = await uploadImage({ file: imgFiles[0] });
    newUrls.push(url);
  }

  return mutations.put(
    getProjectOutcomeEndpoint({ projectId, outcomeId: id }),
    {
      ...outcome,
      imgUrls: newUrls,
    }
  );
};

export const deleteProjectOutcome = (projectId: string, outcomeId: number) => {
  return mutations.delete(getProjectOutcomeEndpoint({ projectId, outcomeId }));
};
