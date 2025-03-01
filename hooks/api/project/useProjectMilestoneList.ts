import useSWR from 'swr';
import {
  getProjectMilestoneEndpoint,
  ProjectMilestoneSchema,
  sortMilestones,
  UpdateProjectMilestoneRequest,
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

  const { mutate, data, ...swr } = useSWR<ProjectMilestoneSchema[]>(swrKey);

  const sortedData = data && sortMilestones(data);

  const handleMutate = (updateData: UpdateProjectMilestoneRequest) => {
    const updatedData = sortedData?.map((milestone) => {
      if (milestone.id !== updateData.id) {
        return milestone;
      }

      return { ...milestone, ...updateData };
    });
    mutate(updatedData);
  };

  const mutations = useProjectMilestone({
    mutateKey: swrKey,
    mutate: handleMutate,
    ...options,
  });

  return {
    ...mutations,
    ...swr,
    data: sortedData,
    mutate,
  };
}
