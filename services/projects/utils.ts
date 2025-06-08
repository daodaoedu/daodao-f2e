import dayjs from 'dayjs';
import { ProjectSchema } from './core';
import { ProjectMilestoneSchema } from './milestones';
import { ProjectTaskSchema } from './tasks';

export const sortTasks = (tasks: ProjectTaskSchema[]) => {
  if (!Array.isArray(tasks)) return [];

  return tasks.concat().sort((a, b) => {
    const diff = a.position - b.position;
    if (diff !== 0) return diff;
    return a.id - b.id;
  });
};

export const getTask = (sortedData: ProjectTaskSchema[], id: number) => {
  if (!Array.isArray(sortedData)) return null;

  const index = sortedData.findIndex((task) => task.id === id);

  if (index === -1) return null;

  return {
    index,
    item: sortedData[index],
    list: sortedData,
  };
};

export const sortMilestones = (milestones: ProjectMilestoneSchema[]) => {
  if (!Array.isArray(milestones)) return [];

  return milestones
    .concat()
    .sort((a, b) => {
      const startDiff = dayjs(a.startDate).diff(dayjs(b.startDate), 'd');
      if (startDiff !== 0) return startDiff;
      if (a.position !== b.position) return a.position - b.position;
      return dayjs(a.endDate).diff(dayjs(b.endDate), 'd');
    })
    .map((milestone) => ({
      ...milestone,
      tasks: sortTasks(milestone.tasks),
    }));
};

export const getMilestone = (
  sortedData: ProjectMilestoneSchema[] | undefined,
  id: number
) => {
  if (!Array.isArray(sortedData)) return null;

  const index = sortedData.findIndex((milestone) => milestone.id === id);

  if (index === -1) return null;

  return {
    index,
    item: sortedData[index],
    list: sortedData,
  };
};

export const sortProjects = (projects: ProjectSchema[]) => {
  if (!Array.isArray(projects)) return [];

  return projects.map((project) => ({
    ...project,
    milestones: sortMilestones(project.milestones),
  }));
};
