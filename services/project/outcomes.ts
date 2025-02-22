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
  description: z.string(),
  imgUrl: z.string().nullable(),
  imgFile: z.instanceof(File).nullable().optional(),
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
  imgFile,
  ...outcome
}: CreateProjectOutcomeRequest) => {
  let newUrl: string | null = null;

  if (imgFile) {
    const { url } = await uploadImage({ file: imgFile });
    newUrl = url;
  }

  return mutations.post(getProjectOutcomeEndpoint({ projectId }), {
    ...outcome,
    imgUrl: newUrl,
  });
};

export const updateProjectOutcomeSchema = projectOutcomeSchema;

export type UpdateProjectOutcomeRequest = z.infer<
  typeof updateProjectOutcomeSchema
>;

export const updateProjectOutcome = async ({
  projectId,
  id,
  imgFile,
  ...outcome
}: UpdateProjectOutcomeRequest) => {
  let newUrl: string | null = null;

  if (imgFile) {
    const { url } = await uploadImage({ file: imgFile });
    newUrl = url;
  }

  return mutations.put(
    getProjectOutcomeEndpoint({ projectId, outcomeId: id }),
    {
      ...outcome,
      imgUrl: newUrl,
    }
  );
};

export const deleteProjectOutcome = (projectId: string, outcomeId: number) => {
  return mutations.delete(getProjectOutcomeEndpoint({ projectId, outcomeId }));
};
