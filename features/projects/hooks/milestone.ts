import useSWR, { KeyedMutator } from 'swr';
import useSWRMutation from 'swr/mutation';

import { projectMilestoneAPI, getProjectMilestonePathname } from '@/services/modules/projects/milestones/api';
import { ProjectMilestoneSchema, ProjectMilestoneFormSchema } from '@/services/modules/projects/milestones/schema';
import { getProjectPathname } from '@/services/modules/projects/core';
import { sortMilestones } from '@/services/modules/projects/utils';

export function useProjectMilestones(projectId?: string | null) {
  const swr = useSWR<ProjectMilestoneSchema[]>(
    projectId ? getProjectMilestonePathname({ projectId }) : null
  );

  return {
    ...swr,
    data: swr.data && sortMilestones(swr.data),
  };
}

interface UseProjectMilestoneMutationProps {
  projectId?: string;
  updateMilestoneCache?: KeyedMutator<ProjectMilestoneSchema[]>;
  onCreated?: () => void;
  onUpdated?: () => void;
  onDeleted?: () => void;
}

export function useProjectMilestoneMutation({
  projectId,
  // updateMilestoneCache,
  onCreated,
  onUpdated,
  onDeleted,
}: UseProjectMilestoneMutationProps = {}) {
  const swrKey = projectId
    ? getProjectMilestonePathname({ projectId })
    : getProjectPathname({ isMe: true });

  const createMutation = useSWRMutation(swrKey, projectMilestoneAPI.create, {
    onSuccess: onCreated,
  });

  const updateMutation = useSWRMutation(swrKey, projectMilestoneAPI.update, {
    onSuccess: onUpdated,
  });

  const deleteMutation = useSWRMutation(swrKey, projectMilestoneAPI.delete, {
    onSuccess: onDeleted,
  });

  // const handleMilestones = (updateData: ProjectMilestoneFormSchema) => {
  //   updateMilestoneCache?.((prevMilestones) => {
  //     const milestone = getMilestone(prevMilestones, updateData.id);

  //     if (!milestone) return prevMilestones;

  //     const updatedMilestone = {
  //       ...milestone.item,
  //       ...updateData,
  //     };

  //     return [
  //       ...milestone.list.slice(0, milestone.index),
  //       updatedMilestone,
  //       ...milestone.list.slice(milestone.index + 1),
  //     ];
  //   });
  // };

  return {
    createMutation,
    updateMutation: {
      ...updateMutation,
      trigger: (updateData: ProjectMilestoneFormSchema) => {
        // handleMilestones(updateData);
        return updateMutation.trigger(updateData);
      },
    },
    deleteMutation,
  };
}
