import useSWR, { KeyedMutator } from 'swr';
import useSWRMutation from 'swr/mutation';

import projectMilestoneAPI, { getProjectMilestonePathname } from './api';
import { ProjectMilestoneSchema, UpdateProjectMilestoneSchema } from './schema';
import { getProjectPathname } from '../core';
import { getMilestone, sortMilestones } from '../utils';

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
  updateMilestoneCache,
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

  const handleMilestones = (updateData: UpdateProjectMilestoneSchema) => {
    updateMilestoneCache?.((prevMilestones) => {
      const milestone = getMilestone(prevMilestones, updateData.id);
      console.log('milestone', milestone, updateData.id);
      if (!milestone) return prevMilestones;

      const updatedMilestone = {
        ...milestone.item,
        ...updateData,
      };

      return [
        ...milestone.list.slice(0, milestone.index),
        updatedMilestone,
        ...milestone.list.slice(milestone.index + 1),
      ];
    });
  };

  return {
    createMutation,
    updateMutation: {
      ...updateMutation,
      trigger: (updateData: UpdateProjectMilestoneSchema) => {
        handleMilestones(updateData);
        return updateMutation.trigger(updateData);
      },
    },
    deleteMutation,
  };
}
