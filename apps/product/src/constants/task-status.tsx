import type { BadgeProps } from "@daodao/ui/components/badge";
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
  variant: BadgeProps["variant"];
}

export interface StatusBadgeConfig {
  label: string;
  variant: BadgeProps["variant"];
}

const statusConfig: Record<TaskStatus, StatusConfig> = {
  [TaskStatus.draft]: {
    label: "草稿",
    variant: "outline-ghost",
  },
  [TaskStatus.notStarted]: {
    label: "未開始",
    variant: "very-light-blue",
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
 * 取得完整的 status 配置（包含 label, variant, icon, buttonLabel）
 */
export const getStatusConfig = (status: TaskStatus | string): StatusConfig => {
  return statusConfig[status as TaskStatus];
};

/**
 * 將 API 的 PracticeStatus 映射到 TaskStatus
 */
export const mapPracticeStatusToTaskStatus = (status: PracticeStatus): TaskStatus => {
  if (status === PracticeStatus.active) {
    return TaskStatus.inProgress;
  }
  if (status === PracticeStatus.draft) {
    return TaskStatus.draft;
  }
  if (status === PracticeStatus.notStarted) {
    return TaskStatus.notStarted;
  }
  if (status === PracticeStatus.completed) {
    return TaskStatus.completed;
  }
  return TaskStatus.completed;
};
