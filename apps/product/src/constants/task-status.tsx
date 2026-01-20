import type { BadgeProps } from "@daodao/ui/components/badge";
import { CalendarCheck, PenLine } from "lucide-react";

export type TaskStatus = "draft" | "not-started" | "in-progress" | "completed";

export interface StatusConfig {
  label: string;
  variant: BadgeProps["variant"];
  icon: React.ReactNode;
  buttonLabel: string;
}

export interface StatusBadgeConfig {
  label: string;
  variant: BadgeProps["variant"];
}

const statusConfig: Record<TaskStatus, StatusConfig> = {
  draft: {
    label: "草稿",
    variant: "outline-ghost",
    icon: <PenLine className="size-4.5 text-logo-cyan" />,
    buttonLabel: "繼續編輯",
  },
  "not-started": {
    label: "未開始",
    variant: "very-light-blue",
    icon: <CalendarCheck className="size-4.5 text-logo-cyan" />,
    buttonLabel: "打卡",
  },
  "in-progress": {
    label: "進行中",
    variant: "default",
    icon: <CalendarCheck className="size-4.5 text-logo-cyan" />,
    buttonLabel: "打卡",
  },
  completed: {
    label: "已完成",
    variant: "default",
    icon: <CalendarCheck className="size-4.5 text-logo-cyan" />,
    buttonLabel: "打卡",
  },
};

/**
 * 取得完整的 status 配置（包含 label, variant, icon, buttonLabel）
 */
export const getStatusConfig = (status: TaskStatus | string): StatusConfig => {
  return statusConfig[status as TaskStatus] ?? statusConfig.draft;
};

/**
 * 取得僅 Badge 相關的 status 配置（包含 label, variant）
 */
export const getStatusBadgeConfig = (status: TaskStatus | string): StatusBadgeConfig => {
  const config = getStatusConfig(status);
  return {
    label: config.label,
    variant: config.variant,
  };
};

