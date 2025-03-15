import { z } from 'zod';
import { mutations } from '../core';
import { updateImage } from '../images';

const projectEndpoint = '/projects';

interface GetProjectNoteListKeyOptions {
  projectId: string;
  noteId?: number;
}

export const getProjectNotePathname = ({
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

export type CreateProjectNoteSchema = z.infer<typeof createProjectNoteSchema>;

export const createProjectNote = async ({
  projectId,
  imgFiles,
  imgUrls,
  ...note
}: CreateProjectNoteSchema) => {
  const updatedImgUrls = await updateImage(imgFiles, imgUrls);

  return mutations.post(getProjectNotePathname({ projectId }), {
    ...note,
    imgUrls: updatedImgUrls,
  });
};

export const updateProjectNoteSchema = projectNoteSchema;

export type UpdateProjectNoteSchema = z.infer<typeof updateProjectNoteSchema>;

export const updateProjectNote = async ({
  id,
  projectId,
  imgFiles,
  imgUrls,
  ...note
}: UpdateProjectNoteSchema) => {
  const updatedImgUrls = await updateImage(imgFiles, imgUrls);

  return mutations.put(getProjectNotePathname({ projectId, noteId: id }), {
    ...note,
    imgUrls: updatedImgUrls,
  });
};

export const deleteProjectNote = (projectId: string, noteId: number) => {
  return mutations.delete(getProjectNotePathname({ projectId, noteId }));
};
