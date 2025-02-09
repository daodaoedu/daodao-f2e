import { z } from 'zod';
import { mutations } from '../httpClient';
import { projectEndpoint } from './index';

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
  description: z.string(),
  img_url: z.string().nullable(),
});

export type ProjectNoteSchema = z.infer<typeof projectNoteSchema>;

export const createProjectNoteSchema = projectNoteSchema.omit({
  id: true,
});

export type CreateProjectNoteRequest = z.infer<typeof createProjectNoteSchema>;

export const createProjectNote = ({
  projectId,
  ...note
}: CreateProjectNoteRequest) => {
  return mutations.post(getProjectNoteEndpoint({ projectId }), note);
};

export const updateProjectNoteSchema = projectNoteSchema;

export type UpdateProjectNoteRequest = z.infer<typeof updateProjectNoteSchema>;

export const updateProjectNote = ({
  id,
  projectId,
  ...note
}: UpdateProjectNoteRequest) => {
  return mutations.put(getProjectNoteEndpoint({ projectId, noteId: id }), note);
};

export const deleteProjectNote = (projectId: string, noteId: number) => {
  return mutations.delete(getProjectNoteEndpoint({ projectId, noteId }));
};
