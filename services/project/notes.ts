import { z } from 'zod';
import { mutations } from '../httpClient';
import { uploadImage } from '../images';

const projectEndpoint = '/projects';

interface GetProjectNoteListKeyOptions {
  projectId: string;
  noteId?: number;
}

export const getProjectNoteEndpoint = ({
  projectId,
  noteId,
}: GetProjectNoteListKeyOptions) => {
  if (noteId) {
    return `${projectEndpoint}/${projectId}/notes/${noteId}`;
  }
  return `${projectEndpoint}/${projectId}/notes`;
};

const projectNoteSchema = z.object({
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

export type ProjectNoteSchema = z.infer<typeof projectNoteSchema>;

export const createProjectNoteSchema = projectNoteSchema.omit({
  id: true,
});

export type CreateProjectNoteRequest = z.infer<typeof createProjectNoteSchema>;

export const createProjectNote = async ({
  projectId,
  imgFiles,
  ...note
}: CreateProjectNoteRequest) => {
  let newUrl: string | null = null;

  if (Array.isArray(imgFiles) && imgFiles.length === 1) {
    const { url } = await uploadImage({ file: imgFiles[0] });
    newUrl = url;
  }

  return mutations.post(getProjectNoteEndpoint({ projectId }), {
    ...note,
    imgUrl: newUrl,
  });
};

export const updateProjectNoteSchema = projectNoteSchema;

export type UpdateProjectNoteRequest = z.infer<typeof updateProjectNoteSchema>;

export const updateProjectNote = async ({
  id,
  projectId,
  imgFiles,
  ...note
}: UpdateProjectNoteRequest) => {
  let newUrl: string | null = null;

  if (Array.isArray(imgFiles) && imgFiles.length === 1) {
    const { url } = await uploadImage({ file: imgFiles[0] });
    newUrl = url;
  }

  return mutations.put(getProjectNoteEndpoint({ projectId, noteId: id }), {
    ...note,
    imgUrl: newUrl,
  });
};

export const deleteProjectNote = (projectId: string, noteId: number) => {
  return mutations.delete(getProjectNoteEndpoint({ projectId, noteId }));
};
