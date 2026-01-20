import type { BadgeProps } from "@daodao/ui/components/badge";

export type TaskStatus = "draft" | "not-started" | "in-progress" | "completed";

export interface StatusConfig {
  label: string;
  variant: BadgeProps["variant"];
}

export interface StatusBadgeConfig {
  label: string;
  variant: BadgeProps["variant"];
}

const statusConfig: Record<TaskStatus, StatusConfig> = {
  draft: {
    label: "草稿",
    variant: "outline-ghost",
  },
  "not-started": {
    label: "未開始",
    variant: "very-light-blue",
  },
  "in-progress": {
    label: "進行中",
    variant: "default",
  },
  completed: {
    label: "已完成",
    variant: "default",
  },
};

/**
 * 取得完整的 status 配置（包含 label, variant, icon, buttonLabel）
 */
export const getStatusConfig = (status: TaskStatus | string): StatusConfig => {
  return statusConfig[status as TaskStatus] ?? statusConfig.draft;
};
