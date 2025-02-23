import useSWR from 'swr';
import {
  getProjectMilestoneEndpoint,
  ProjectMilestoneSchema,
} from '@/services/project/milestone';

import useProjectMilestone from './useProjectMilestone';

interface UseProjectMilestoneListOptions {
  onCreated?: () => void;
  onUpdated?: () => void;
  onDeleted?: () => void;
}

export default function useProjectMilestoneList(
  projectId?: string,
  options?: UseProjectMilestoneListOptions
) {
  const swrKey = projectId ? getProjectMilestoneEndpoint({ projectId }) : null;

  const { mutate, ...swr } = useSWR<ProjectMilestoneSchema[]>(swrKey);

  const mutations = useProjectMilestone({
    mutateKey: swrKey,
    ...options,
  });

  return {
    ...mutations,
    ...swr,
    mutate,
  };
}
