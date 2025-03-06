import useSWR from 'swr';
import { getProjectEndpoint, ProjectSchema } from '@/services/projects';
import {
  sortMilestones,
  UpdateProjectMilestoneRequest,
} from '@/services/projects/milestones';
import { sortTasks, UpdateProjectTaskRequest } from '@/services/projects/tasks';
import useProject from './useProject';
import useProjectMilestone from './useProjectMilestone';
import useProjectTask from './useProjectTask';

interface UseProjectListProps {
  isMe: boolean;
  onCreated?: (data: ProjectSchema) => void;
  onUpdated?: (data: ProjectSchema) => void;
  onDeleted?: () => void;
}

export default function useProjectList(
  { isMe, onCreated, onUpdated, onDeleted }: UseProjectListProps = {
    isMe: false,
  }
) {
  const swrKey = getProjectEndpoint({ isMe });

  const { mutate, data, ...swr } = useSWR<ProjectSchema[]>(swrKey);

  const sortedData =
    data &&
    data.map((project) => ({
      ...project,
      milestones: sortMilestones(project.milestones).map((milestone) => ({
        ...milestone,
        tasks: sortTasks(milestone.tasks),
      })),
    }));

  const mutations = useProject({
    mutateKey: swrKey,
    onCreated,
    onUpdated,
    onDeleted,
  });

  const handleMilestones = (updateData: UpdateProjectMilestoneRequest) => {
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
    mutate: handleMilestones,
  });

  const handleTasks = (updateData: UpdateProjectTaskRequest) => {
    const updatedData = sortedData?.map((project) => {
      if (project.id !== updateData.projectId) {
        return project;
      }

      const updatedMilestones = project.milestones.map((milestone) => {
        if (milestone.id !== updateData.milestoneId) {
          return milestone;
        }

        const updatedTasks = milestone.tasks.map((task) => {
          if (task.id !== updateData.id) {
            return task;
          }

          return { ...task, ...updateData };
        });

        return { ...milestone, tasks: updatedTasks };
      });

      return { ...project, milestones: updatedMilestones };
    });
    mutate(updatedData);
  };

  const taskMutations = useProjectTask({
    mutateKey: swrKey,
    mutate: handleTasks,
  });

  return {
    ...mutations,
    ...swr,
    data: sortedData,
    mutate,
    milestoneMutations,
    taskMutations,
  };
}
