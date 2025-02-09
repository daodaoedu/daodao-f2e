import toast from 'react-hot-toast';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import {
  CreateProjectOutcomeRequest,
  ProjectOutcomeSchema,
  UpdateProjectOutcomeRequest,
  createProjectOutcome,
  deleteProjectOutcome,
  getProjectOutcomeEndpoint,
  updateProjectOutcome,
} from '@/services/project/outcomes';

interface UseProjectOutcomeMutationOptions {
  projectId?: string;
  outcomeId?: number;
  mutateKey?: string | null;
  onCreated?: () => void;
  onUpdated?: () => void;
  onDeleted?: () => void;
}

export default function useProjectOutcomeMutation({
  projectId,
  outcomeId,
  mutateKey,
  onCreated,
  onUpdated,
  onDeleted,
}: UseProjectOutcomeMutationOptions) {
  const swrKey =
    projectId && outcomeId
      ? getProjectOutcomeEndpoint({ projectId, outcomeId })
      : null;

  const { data, ...swr } = useSWR<ProjectOutcomeSchema>(swrKey);

  const create = useSWRMutation(
    swrKey ?? mutateKey,
    (url, { arg }: { arg: CreateProjectOutcomeRequest }) =>
      createProjectOutcome(arg),
    {
      onSuccess: onCreated,
      onError: () => {
        toast.error('新增學習成果失敗');
      },
    }
  );

  const update = useSWRMutation(
    swrKey ?? mutateKey,
    (url, { arg }: { arg: UpdateProjectOutcomeRequest }) =>
      updateProjectOutcome(arg),
    {
      onSuccess: onUpdated,
      onError: () => {
        toast.error('更新學習成果失敗');
      },
    }
  );

  const remove = useSWRMutation(
    swrKey ?? mutateKey,
    (url, { arg }: { arg: { projectId: string; outcomeId: number } }) =>
      deleteProjectOutcome(arg.projectId, arg.outcomeId),
    {
      onSuccess: onDeleted,
      onError: () => {
        toast.error('刪除學習成果失敗');
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
