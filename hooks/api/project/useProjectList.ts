import useSWR from 'swr';
import { getProjectEndpoint } from '@/services/project';
import { Project } from '@/components/Projects/Project/type';
import {
  sortMilestones,
  UpdateProjectMilestoneRequest,
} from '@/services/project/milestone';
import useProject from './useProject';
import useProjectMilestone from './useProjectMilestone';

interface UseProjectListProps {
  isMe: boolean;
  onCreated?: (data: Project) => void;
  onUpdated?: (data: Project) => void;
  onDeleted?: () => void;
}

export default function useProjectList(
  { isMe, onCreated, onUpdated, onDeleted }: UseProjectListProps = {
    isMe: false,
  }
) {
  const swrKey = getProjectEndpoint({ isMe });

  const { mutate, data, ...swr } = useSWR<Project[]>(swrKey);

  const sortedData =
    data &&
    data.map((project) => {
      return {
        ...project,
        milestones: sortMilestones(project.milestones),
      };
    });

  const mutations = useProject({
    mutateKey: swrKey,
    onCreated,
    onUpdated,
    onDeleted,
  });

  const handleMutate = (updateData: UpdateProjectMilestoneRequest) => {
    const updatedData = sortedData?.map((project) => {
      if (project.id !== updateData.projectId) {
        return project;
      }

      const updatedMilestones = project.milestones.map((milestone) => {
        if (milestone.id !== updateData.id) {
          return milestone;
        }

        return { ...milestone, ...updateData };
      });

      return { ...project, milestones: updatedMilestones };
    });
    mutate(updatedData);
  };

  const milestoneMutations = useProjectMilestone({
    mutateKey: swrKey,
    mutate: handleMutate,
  });

  return {
    ...mutations,
    ...swr,
    data: sortedData,
    mutate,
    milestoneMutations,
  };
}
