import useSWR, { KeyedMutator } from 'swr';
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
  list?: ProjectMilestoneSchema[];
  mutateKey?: string | null;
  mutate?: KeyedMutator<ProjectMilestoneSchema[]>;
  onCreated?: () => void;
  onUpdated?: () => void;
  onDeleted?: () => void;
}

export default function useProjectMilestone({
  projectId,
  milestoneId,
  list,
  mutateKey,
  mutate,
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
    async (url, { arg }: { arg: UpdateProjectMilestoneRequest }) => {
      await updateProjectMilestone(arg);

      if (!Array.isArray(list)) return;

      const targetMilestoneIndex = list.findIndex(
        (milestone) => milestone.id === arg.id
      );

      if (targetMilestoneIndex === -1) return;

      mutate?.(
        list.map((milestone, index) => {
          if (index === targetMilestoneIndex) {
            return {
              ...milestone,
              ...arg,
            };
          }

          return milestone;
        })
      );
    },
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
