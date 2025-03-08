import useSWRMutation from 'swr/mutation';
import {
  CreateProjectTaskRequest,
  DeleteProjectTaskRequest,
  UpdateProjectTaskRequest,
  createProjectTask,
  deleteProjectTask,
  updateProjectTask,
} from '@/services/projects/tasks';

interface UseProjectTaskOptions {
  mutateKey?: string | null;
  mutate?: (data: UpdateProjectTaskRequest) => void;
  onCreated?: () => void;
  onUpdated?: () => void;
  onDeleted?: () => void;
}

export default function useProjectTask({
  mutateKey,
  mutate,
  onCreated,
  onUpdated,
  onDeleted,
}: UseProjectTaskOptions) {
  const create = useSWRMutation(
    mutateKey,
    (url, { arg }: { arg: CreateProjectTaskRequest }) => createProjectTask(arg),
    { onSuccess: onCreated }
  );

  const update = useSWRMutation(
    mutateKey,
    async (url, { arg }: { arg: UpdateProjectTaskRequest }) => {
      await updateProjectTask(arg);

      mutate?.(arg);
    },
    { onSuccess: onUpdated }
  );

  const remove = useSWRMutation(
    mutateKey,
    (url, { arg }: { arg: DeleteProjectTaskRequest }) => deleteProjectTask(arg),
    { onSuccess: onDeleted }
  );

  return {
    create,
    update,
    remove,
  };
}
