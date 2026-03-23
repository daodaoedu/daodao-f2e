import { PracticeStatus } from "./practice-status";

/**
 * 任務狀態運行時常數
 */
export const TaskStatus = {
  draft: "draft",
  notStarted: "not-started",
  inProgress: "in-progress",
  completed: "completed",
} as const;

/**
 * 任務狀態類型
 */
export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

/**
 * 篩選狀態運行時常數
 */
export const FilterStatus = {
  all: "all",
  draft: "draft",
  notStarted: "not-started",
  inProgress: "in-progress",
  completed: "completed",
} as const;

/**
 * 篩選狀態類型
 */
export type FilterStatus = (typeof FilterStatus)[keyof typeof FilterStatus];

export interface StatusConfig {
  label: string;
  variant: "default" | "outline" | "secondary";
}

const statusConfig: Record<TaskStatus, StatusConfig> = {
  [TaskStatus.draft]: {
    label: "草稿",
    variant: "outline",
  },
  [TaskStatus.notStarted]: {
    label: "未開始",
    variant: "secondary",
  },
  [TaskStatus.inProgress]: {
    label: "進行中",
    variant: "default",
  },
  [TaskStatus.completed]: {
    label: "已完成",
    variant: "default",
  },
};

/**
 * 取得完整的 status 配置（包含 label, variant）
 */
export const getStatusConfig = (status: TaskStatus | string): StatusConfig => {
  return statusConfig[status as TaskStatus];
};

/**
 * 將 API 的 PracticeStatus 映射到 TaskStatus
 */
export const mapPracticeStatusToTaskStatus = (status: PracticeStatus): TaskStatus => {
  switch (status) {
    case PracticeStatus.active:
      return TaskStatus.inProgress;
    case PracticeStatus.draft:
      return TaskStatus.draft;
    case PracticeStatus.notStarted:
      return TaskStatus.notStarted;
    case PracticeStatus.completed:
      return TaskStatus.completed;
    case PracticeStatus.archived:
      // 封存狀態視為已完成
      return TaskStatus.completed;
    default:
      return TaskStatus.completed;
  }
};
