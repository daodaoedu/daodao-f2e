import { FilterStatus, type FilterStatus as FilterStatusType } from "@/constants/task-status";

interface HasStatus {
  status: string;
}

export type MineFilterCounts = Record<FilterStatusType, number>;

export function buildMineFilterCounts(tasks: HasStatus[]): MineFilterCounts {
  const counts: MineFilterCounts = {
    [FilterStatus.all]: tasks.length,
    [FilterStatus.draft]: 0,
    [FilterStatus.notStarted]: 0,
    [FilterStatus.inProgress]: 0,
    [FilterStatus.completed]: 0,
  };
  for (const task of tasks) {
    if (task.status in counts && task.status !== FilterStatus.all) {
      counts[task.status as FilterStatusType]++;
    }
  }
  return counts;
}

export function applyMineFilter<T extends HasStatus>(tasks: T[], status: FilterStatusType): T[] {
  if (status === FilterStatus.all) return tasks;
  return tasks.filter((t) => t.status === status);
}
