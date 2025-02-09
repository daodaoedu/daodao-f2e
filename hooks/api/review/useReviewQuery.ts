import useSWR from 'swr';
import { getProjectReviewEndpoint, ProjectReviewSchema } from '@/services/project/reviews';

import useProjectReviewMutation from './useReviewMutation';

interface UseProjectReviewQueryOptions {
  onCreated?: () => void;
  onUpdated?: () => void;
  onDeleted?: () => void;
}

export default function useProjectReviewQuery(
  projectId?: string,
  options?: UseProjectReviewQueryOptions
) {
  const swrKey = projectId ? getProjectReviewEndpoint({ projectId }) : null;

  const { mutate, ...swr } = useSWR<ProjectReviewSchema[]>(swrKey);

  const mutations = useProjectReviewMutation({
    mutateKey: swrKey,
    ...options,
  });

  return {
    ...mutations,
    ...swr,
    mutate,
  };
}
