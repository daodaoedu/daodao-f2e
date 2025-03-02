import useSWR from 'swr';
import {
  getMilestone,
  getProjectMilestoneEndpoint,
  ProjectMilestoneSchema,
  sortMilestones,
  UpdateProjectMilestoneRequest,
} from '@/services/project/milestone';
import { getTask, UpdateProjectTaskRequest } from '@/services/project/tasks';

import useProjectMilestone from './useProjectMilestone';
import useProjectTask from './useProjectTask';

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

  const handleMilestones = (updateData: UpdateProjectMilestoneRequest) => {
    const milestone = getMilestone(sortedData, updateData.id);

    if (!milestone) return;

    const updatedMilestone = {
      ...milestone.item,
      ...updateData,
    };
    const updatedData = [
      ...milestone.list.slice(0, milestone.index),
      updatedMilestone,
      ...milestone.list.slice(milestone.index + 1),
    ];

    mutate(updatedData);
  };

  const mutations = useProjectMilestone({
    mutateKey: swrKey,
    mutate: handleMilestones,
    ...options,
  });

  const handleTasks = (updateData: UpdateProjectTaskRequest) => {
    const milestone = getMilestone(sortedData, updateData.milestoneId);

    if (!milestone) return;

    const task = getTask(milestone.item.tasks, updateData.id);

    if (!task) return;

    const updatedTask = {
      ...task.item,
      ...updateData,
    };
    const updatedTasks = [
      ...milestone.item.tasks.slice(0, task.index),
      updatedTask,
      ...milestone.item.tasks.slice(task.index + 1),
    ];
    const updatedMilestone = {
      ...milestone.item,
      tasks: updatedTasks,
    };
    const updatedData = [
      ...milestone.list.slice(0, milestone.index),
      updatedMilestone,
      ...milestone.list.slice(milestone.index + 1),
    ];

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
    taskMutations,
  };
}
