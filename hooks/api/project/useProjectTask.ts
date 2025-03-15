import useSWRMutation from 'swr/mutation';
import {
  CreateProjectTaskSchema,
  DeleteProjectTaskSchema,
  UpdateProjectTaskSchema,
  createProjectTask,
  deleteProjectTask,
  updateProjectTask,
} from '@/services/projects/tasks';

interface UseProjectTaskOptions {
  mutateKey?: string | null;
  mutate?: (data: UpdateProjectTaskSchema) => void;
  onCreated?: () => void;
  onUpdated?: () => void;
  onDeleted?: () => void;
}

/** @deprecated */
export default function useProjectTask({
  mutateKey,
  mutate,
  onCreated,
  onUpdated,
  onDeleted,
}: UseProjectTaskOptions) {
  const createMutation = useSWRMutation(
    mutateKey,
    (url, { arg }: { arg: CreateProjectTaskSchema }) => createProjectTask(arg),
    { onSuccess: onCreated }
  );

  const updateMutation = useSWRMutation(
    mutateKey,
    async (url, { arg }: { arg: UpdateProjectTaskSchema }) => {
      await updateProjectTask(arg);

      mutate?.(arg);
    },
    { onSuccess: onUpdated }
  );

  const deleteMutation = useSWRMutation(
    mutateKey,
    (url, { arg }: { arg: DeleteProjectTaskSchema }) => deleteProjectTask(arg),
    { onSuccess: onDeleted }
  );

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
