import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import {
  CreateProjectNoteSchema,
  ProjectNoteSchema,
  UpdateProjectNoteSchema,
  createProjectNote,
  deleteProjectNote,
  getProjectNotePathname,
  updateProjectNote,
} from '@/services/projects/notes';

interface UseProjectNoteOptions {
  projectId?: string;
  noteId?: number;
  mutateKey?: string | null;
  onCreated?: () => void;
  onUpdated?: () => void;
  onDeleted?: () => void;
}

export default function useProjectNote({
  projectId,
  noteId,
  mutateKey,
  onCreated,
  onUpdated,
  onDeleted,
}: UseProjectNoteOptions) {
  const swrKey =
    projectId && noteId ? getProjectNotePathname({ projectId, noteId }) : null;

  const { data, ...swr } = useSWR<ProjectNoteSchema>(swrKey);

  const createMutation = useSWRMutation(
    swrKey ?? mutateKey,
    (url, { arg }: { arg: CreateProjectNoteSchema }) => createProjectNote(arg),
    { onSuccess: onCreated }
  );

  const updateMutation = useSWRMutation(
    swrKey ?? mutateKey,
    (url, { arg }: { arg: UpdateProjectNoteSchema }) => updateProjectNote(arg),
    { onSuccess: onUpdated }
  );

  const deleteMutation = useSWRMutation(
    swrKey ?? mutateKey,
    (url, { arg }: { arg: { projectId: string; noteId: number } }) =>
      deleteProjectNote(arg.projectId, arg.noteId),
    { onSuccess: onDeleted }
  );

  return {
    ...swr,
    data,
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
