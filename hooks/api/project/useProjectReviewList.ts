import useSWR from 'swr';
import { getProjectReviewEndpoint, ProjectReviewSchema } from '@/services/projects/reviews';

import useProjectReview from './useProjectReview';

interface UseProjectReviewListOptions {
  onCreated?: () => void;
  onUpdated?: () => void;
  onDeleted?: () => void;
}

export default function useProjectReviewList(
  projectId?: string,
  options?: UseProjectReviewListOptions
) {
  const swrKey = projectId ? getProjectReviewEndpoint({ projectId }) : null;

  const { mutate, ...swr } = useSWR<ProjectReviewSchema[]>(swrKey);

  const mutations = useProjectReview({
    mutateKey: swrKey,
    ...options,
  });

  return {
    ...mutations,
    ...swr,
    mutate,
  };
}
