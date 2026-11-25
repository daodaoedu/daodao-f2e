import { PracticeStatus } from "@/constants/practice-status";
import { FilterStatus, type FilterStatus as FilterStatusType } from "@/constants/task-status";
import { getCohortPracticeDisplayStatus } from "@/utils/practice-schedule-lock";

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
    const status = task.status as FilterStatusType;
    if (status !== FilterStatus.all && Object.hasOwn(counts, status)) {
      counts[status]++;
    }
  }
  return counts;
}

export function applyMineFilter<T extends HasStatus>(tasks: T[], status: FilterStatusType): T[] {
  if (status === FilterStatus.all) return tasks;
  return tasks.filter((t) => t.status === status);
}

interface MinePracticeStatusInput {
  status?: PracticeStatus;
  isCohortPractice?: boolean;
  isChallenge?: boolean;
  startDate?: string | null;
  endDate?: string | null;
}

/**
 * 「我的」列表的實踐狀態：燈塔場次實踐打卡前 DB 仍是 draft，列表與詳情頁同一規則，
 * 依實踐自身起訖日顯示未開始／進行中／已完成，不顯示「草稿」也不算進草稿篩選（daodao#544）。
 */
export function minePracticeStatus(practice: MinePracticeStatusInput, now: Date = new Date()) {
  const isLighthouseCohort = practice.isCohortPractice === true && practice.isChallenge !== true;
  return {
    status: getCohortPracticeDisplayStatus(practice.status, isLighthouseCohort, practice, now),
    needsActivation: isLighthouseCohort && practice.status === PracticeStatus.draft,
    lockBeforeStartDate: isLighthouseCohort,
  };
}
