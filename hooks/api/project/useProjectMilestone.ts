import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import {
  CreateProjectMilestoneSchema,
  ProjectMilestoneSchema,
  UpdateProjectMilestoneSchema,
  createProjectMilestone,
  deleteProjectMilestone,
  getProjectMilestonePathname,
  updateProjectMilestone,
} from '@/services/projects/milestones';

interface UseProjectMilestoneOptions {
  projectId?: string;
  milestoneId?: number;
  mutateKey?: string | null;
  mutate?: (data: UpdateProjectMilestoneSchema) => void;
  onCreated?: () => void;
  onUpdated?: () => void;
  onDeleted?: () => void;
}

/** @deprecated */
export default function useProjectMilestone({
  projectId,
  milestoneId,
  mutateKey,
  mutate,
  onCreated,
  onUpdated,
  onDeleted,
}: UseProjectMilestoneOptions) {
  const swrKey =
    projectId && milestoneId
      ? getProjectMilestonePathname({ projectId, milestoneId })
      : null;

  const { data, ...swr } = useSWR<ProjectMilestoneSchema>(swrKey);

  const createMutation = useSWRMutation(
    swrKey ?? mutateKey,
    (url, { arg }: { arg: CreateProjectMilestoneSchema }) =>
      createProjectMilestone(arg),
    { onSuccess: onCreated }
  );

  const updateMutation = useSWRMutation(
    swrKey ?? mutateKey,
    async (url, { arg }: { arg: UpdateProjectMilestoneSchema }) => {
      await updateProjectMilestone(arg);

      mutate?.(arg);
    },
    { onSuccess: onUpdated }
  );

  const deleteMutation = useSWRMutation(
    swrKey ?? mutateKey,
    (url, { arg }: { arg: { projectId: string; milestoneId: number } }) =>
      deleteProjectMilestone(arg.projectId, arg.milestoneId),
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
