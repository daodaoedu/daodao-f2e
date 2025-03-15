import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

import projectOutcomeAPI, { getProjectOutcomePathname } from './api';
import { ProjectOutcomeSchema } from './schema';
import { getProjectPathname } from '../core';

export function useProjectOutcomes(projectId?: string | null) {
  return useSWR<ProjectOutcomeSchema[]>(
    projectId ? getProjectOutcomePathname({ projectId }) : null
  );
}

interface UseProjectOutcomeProps {
  projectId?: string | null;
  outcomeId?: number | null;
}

export function useProjectOutcome({
  projectId,
  outcomeId,
}: UseProjectOutcomeProps) {
  return useSWR<ProjectOutcomeSchema>(
    projectId && typeof outcomeId === 'number'
      ? getProjectOutcomePathname({ projectId, outcomeId })
      : null
  );
}

interface UseProjectOutcomeMutationProps extends UseProjectOutcomeProps {
  onCreated?: () => void;
  onUpdated?: () => void;
  onDeleted?: () => void;
}

export function useProjectOutcomeMutation({
  projectId,
  outcomeId,
  onCreated,
  onUpdated,
  onDeleted,
}: UseProjectOutcomeMutationProps = {}) {
  const swrKey = projectId
    ? getProjectOutcomePathname({ projectId, outcomeId })
    : getProjectPathname({ isMe: true });

  const createMutation = useSWRMutation(swrKey, projectOutcomeAPI.create, {
    onSuccess: onCreated,
  });

  const updateMutation = useSWRMutation(swrKey, projectOutcomeAPI.update, {
    onSuccess: onUpdated,
  });

  const deleteMutation = useSWRMutation(swrKey, projectOutcomeAPI.delete, {
    onSuccess: onDeleted,
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
