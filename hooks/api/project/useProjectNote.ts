import toast from 'react-hot-toast';
import useSWR, { useSWRConfig } from 'swr';
import useSWRMutation from 'swr/mutation';
import {
  CreateProjectNoteRequest,
  ProjectNoteSchema,
  UpdateProjectNoteRequest,
  createProjectNote,
  deleteProjectNote,
  getProjectNoteEndpoint,
  updateProjectNote,
} from '@/services/project/notes';

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
    projectId && noteId ? getProjectNoteEndpoint({ projectId, noteId }) : null;

  const config = useSWRConfig();
  const { data, ...swr } = useSWR<ProjectNoteSchema>(swrKey);

  const create = useSWRMutation(
    swrKey ?? mutateKey,
    (url, { arg }: { arg: CreateProjectNoteRequest }) => createProjectNote(arg),
    {
      onSuccess: onCreated,
      onError: (error, key) => {
        config.onError?.(error, key, config);
        toast.error('新增便利貼失敗');
      },
    }
  );

  const update = useSWRMutation(
    swrKey ?? mutateKey,
    (url, { arg }: { arg: UpdateProjectNoteRequest }) => updateProjectNote(arg),
    {
      onSuccess: onUpdated,
      onError: (error, key) => {
        config.onError?.(error, key, config);
        toast.error('更新便利貼失敗');
      },
    }
  );

  const remove = useSWRMutation(
    swrKey ?? mutateKey,
    (url, { arg }: { arg: { projectId: string; noteId: number } }) =>
      deleteProjectNote(arg.projectId, arg.noteId),
    {
      onSuccess: onDeleted,
      onError: (error, key) => {
        config.onError?.(error, key, config);
        toast.error('刪除便利貼失敗');
      },
    }
  );

  return {
    ...swr,
    data,
    create,
    update,
    remove,
  };
}
