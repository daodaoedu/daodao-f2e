import toast from 'react-hot-toast';
import useSWR, { useSWRConfig } from 'swr';
import useSWRMutation from 'swr/mutation';
import { Project } from '@/components/Projects/Project/type';
import {
  createProject,
  CreateProjectRequest,
  deleteProject,
  getProjectEndpoint,
  updateProject,
  UpdateProjectRequest,
} from '@/services/project';

interface UseProjectOptions {
  id?: string;
  mutateKey?: string | null;
  onCreated?: (data: Project) => void;
  onUpdated?: (data: Project) => void;
  onDeleted?: () => void;
}

export default function useProject({
  id,
  mutateKey,
  onCreated,
  onUpdated,
  onDeleted,
}: UseProjectOptions) {
  const swrKey = id ? getProjectEndpoint({ id }) : null;

  const config = useSWRConfig();
  const { mutate, ...swr } = useSWR<Project>(swrKey);

  const create = useSWRMutation(
    swrKey ?? mutateKey,
    (url, { arg }: { arg: CreateProjectRequest }) => createProject(arg),
    {
      onSuccess: onCreated,
      onError: (error, key) => {
        config.onError?.(error, key, config);
        toast.error('新增計畫失敗');
      },
    }
  );

  const update = useSWRMutation(
    swrKey ?? mutateKey,
    (url, { arg }: { arg: UpdateProjectRequest }) => updateProject(arg),
    {
      onSuccess: onUpdated,
      onError: (error, key) => {
        config.onError?.(error, key, config);
        toast.error('更新計畫失敗');
      },
    }
  );

  const remove = useSWRMutation(
    swrKey ?? mutateKey,
    (url, { arg }: { arg: { id: string } }) => deleteProject(arg.id),
    {
      onSuccess: onDeleted,
      onError: (error, key) => {
        config.onError?.(error, key, config);
        toast.error('刪除計畫失敗');
      },
    }
  );

  return {
    ...swr,
    mutate,
    create,
    update,
    remove,
  };
}
