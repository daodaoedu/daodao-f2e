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

interface UseProjectOutcomeOptions {
  projectId?: string;
  outcomeId?: number;
  mutateKey?: string | null;
  onCreated?: () => void;
  onUpdated?: () => void;
  onDeleted?: () => void;
}

export default function useProjectOutcome({
  projectId,
  outcomeId,
  mutateKey,
  onCreated,
  onUpdated,
  onDeleted,
}: UseProjectOutcomeOptions) {
  const swrKey =
    projectId && outcomeId
      ? getProjectOutcomeEndpoint({ projectId, outcomeId })
      : null;

  const { data, ...swr } = useSWR<ProjectOutcomeSchema>(swrKey);

  const create = useSWRMutation(
    swrKey ?? mutateKey,
    (url, { arg }: { arg: CreateProjectOutcomeRequest }) =>
      createProjectOutcome(arg),
    { onSuccess: onCreated }
  );

  const update = useSWRMutation(
    swrKey ?? mutateKey,
    (url, { arg }: { arg: UpdateProjectOutcomeRequest }) =>
      updateProjectOutcome(arg),
    { onSuccess: onUpdated }
  );

  const remove = useSWRMutation(
    swrKey ?? mutateKey,
    (url, { arg }: { arg: { projectId: string; outcomeId: number } }) =>
      deleteProjectOutcome(arg.projectId, arg.outcomeId),
    { onSuccess: onDeleted }
  );

  return {
    ...swr,
    data,
    create,
    update,
    remove,
  };
}
