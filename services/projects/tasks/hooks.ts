import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

import projectTaskAPI, { getProjectTaskPathname } from './api';
import { ProjectTaskSchema } from './schema';
import { getProjectPathname } from '../core';
import { sortTasks } from '../utils';

interface UseProjectTasksProps {
  projectId?: string;
  milestoneId?: number;
}

export function useProjectTasks({
  projectId,
  milestoneId,
}: UseProjectTasksProps) {
  const swr = useSWR<ProjectTaskSchema[]>(
    projectId && milestoneId
      ? getProjectTaskPathname({ projectId, milestoneId })
      : null
  );

  return {
    ...swr,
    data: swr.data && sortTasks(swr.data),
  };
}

interface UseProjectTaskMutationProps {
  projectId?: string;
  milestoneId?: number;
  onCreated?: () => void;
  onUpdated?: () => void;
  onDeleted?: () => void;
}

export function useProjectTaskMutation({
  projectId,
  milestoneId,
  onCreated,
  onUpdated,
  onDeleted,
}: UseProjectTaskMutationProps = {}) {
  const swrKey =
    projectId && milestoneId
      ? getProjectTaskPathname({ projectId, milestoneId })
      : getProjectPathname({ isMe: true });

  const createMutation = useSWRMutation(swrKey, projectTaskAPI.create, {
    onSuccess: onCreated,
  });

  const updateMutation = useSWRMutation(swrKey, projectTaskAPI.update, {
    onSuccess: onUpdated,
  });

  const deleteMutation = useSWRMutation(swrKey, projectTaskAPI.delete, {
    onSuccess: onDeleted,
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
