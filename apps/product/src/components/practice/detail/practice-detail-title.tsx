"use client";

import type { PracticeStatus } from "@/constants/practice-status";
import { getStatusConfig, mapPracticeStatusToTaskStatus } from "@/constants/task-status";

interface PracticeDetailTitleProps {
  title: string;
  status?: PracticeStatus;
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
}

export const PracticeDetailTitle = ({
  title,
  status,
}: PracticeDetailTitleProps) => {
  const taskStatus = status ? mapPracticeStatusToTaskStatus(status) : undefined;
  const _statusInfo = taskStatus ? getStatusConfig(taskStatus) : undefined;

  return (
    <h1 className="text-lg font-semibold text-text-dark text-left line-clamp-2 mb-6">
      {title}
    </h1>
  );
};
