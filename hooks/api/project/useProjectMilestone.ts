import toast from 'react-hot-toast';
import useSWR, { useSWRConfig } from 'swr';
import useSWRMutation from 'swr/mutation';
import {
  CreateProjectMilestoneRequest,
  ProjectMilestoneSchema,
  UpdateProjectMilestoneRequest,
  createProjectMilestone,
  deleteProjectMilestone,
  getProjectMilestoneEndpoint,
  updateProjectMilestone,
} from '@/services/project/milestone';

interface UseProjectMilestoneOptions {
  projectId?: string;
  milestoneId?: number;
  mutateKey?: string | null;
  onCreated?: () => void;
  onUpdated?: () => void;
  onDeleted?: () => void;
}

export default function useProjectMilestone({
  projectId,
  milestoneId,
  mutateKey,
  onCreated,
  onUpdated,
  onDeleted,
}: UseProjectMilestoneOptions) {
  const swrKey =
    projectId && milestoneId
      ? getProjectMilestoneEndpoint({ projectId, milestoneId })
      : null;

  const config = useSWRConfig();
  const { data, ...swr } = useSWR<ProjectMilestoneSchema>(swrKey);

  const create = useSWRMutation(
    swrKey ?? mutateKey,
    (url, { arg }: { arg: CreateProjectMilestoneRequest }) =>
      createProjectMilestone(arg),
    {
      onSuccess: onCreated,
      onError: (error, key) => {
        config.onError?.(error, key, config);
        toast.error('新增里程碑失敗');
      },
    }
  );

  const update = useSWRMutation(
    swrKey ?? mutateKey,
    (url, { arg }: { arg: UpdateProjectMilestoneRequest }) =>
      updateProjectMilestone(arg),
    {
      onSuccess: onUpdated,
      onError: (error, key) => {
        config.onError?.(error, key, config);
        toast.error('更新里程碑失敗');
      },
    }
  );

  const remove = useSWRMutation(
    swrKey ?? mutateKey,
    (url, { arg }: { arg: { projectId: string; milestoneId: number } }) =>
      deleteProjectMilestone(arg.projectId, arg.milestoneId),
    {
      onSuccess: onDeleted,
      onError: (error, key) => {
        config.onError?.(error, key, config);
        toast.error('刪除里程碑失敗');
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
