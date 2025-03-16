import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

import projectReviewAPI, { getProjectReviewPathname } from './api';
import { ProjectReviewSchema } from './schema';
import { getProjectPathname } from '../core';

export function useProjectReviews(projectId?: string | null) {
  return useSWR<ProjectReviewSchema[]>(
    projectId ? getProjectReviewPathname({ projectId }) : null
  );
}

interface UseProjectReviewProps {
  projectId?: string | null;
  reviewId?: number | null;
}

export function useProjectReview({
  projectId,
  reviewId,
}: UseProjectReviewProps) {
  return useSWR<ProjectReviewSchema>(
    projectId && typeof reviewId === 'number'
      ? getProjectReviewPathname({ projectId, reviewId })
      : null
  );
}

interface UseProjectReviewMutationProps extends UseProjectReviewProps {
  onCreated?: () => void;
  onUpdated?: () => void;
  onDeleted?: () => void;
}

export function useProjectReviewMutation({
  projectId,
  reviewId,
  onCreated,
  onUpdated,
  onDeleted,
}: UseProjectReviewMutationProps = {}) {
  const swrKey = projectId
    ? getProjectReviewPathname({ projectId, reviewId })
    : getProjectPathname();

  const createMutation = useSWRMutation(swrKey, projectReviewAPI.create, {
    onSuccess: onCreated,
  });

  const updateMutation = useSWRMutation(swrKey, projectReviewAPI.update, {
    onSuccess: onUpdated,
  });

  const deleteMutation = useSWRMutation(swrKey, projectReviewAPI.delete, {
    onSuccess: onDeleted,
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
