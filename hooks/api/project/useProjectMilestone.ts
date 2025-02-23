import useSWR from 'swr';
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

  const { data, ...swr } = useSWR<ProjectMilestoneSchema>(swrKey);

  const create = useSWRMutation(
    swrKey ?? mutateKey,
    (url, { arg }: { arg: CreateProjectMilestoneRequest }) =>
      createProjectMilestone(arg),
    { onSuccess: onCreated }
  );

  const update = useSWRMutation(
    swrKey ?? mutateKey,
    (url, { arg }: { arg: UpdateProjectMilestoneRequest }) =>
      updateProjectMilestone(arg),
    { onSuccess: onUpdated }
  );

  const remove = useSWRMutation(
    swrKey ?? mutateKey,
    (url, { arg }: { arg: { projectId: string; milestoneId: number } }) =>
      deleteProjectMilestone(arg.projectId, arg.milestoneId),
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
