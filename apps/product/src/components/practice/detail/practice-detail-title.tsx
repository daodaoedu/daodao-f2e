"use client";

import { Button } from "@daodao/ui/components/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { PracticeStatus } from "@/constants/practice-status";
import { getStatusConfig, mapPracticeStatusToTaskStatus } from "@/constants/task-status";

interface PracticeDetailTitleProps {
  title: string;
  status?: PracticeStatus;
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  previousDisabled?: boolean;
  nextDisabled?: boolean;
  previousLabel?: string;
  nextLabel?: string;
}

export const PracticeDetailTitle = ({
  title,
  status,
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
  previousDisabled = false,
  nextDisabled = false,
  previousLabel,
  nextLabel,
}: PracticeDetailTitleProps) => {
  const taskStatus = status ? mapPracticeStatusToTaskStatus(status) : undefined;
  const _statusInfo = taskStatus ? getStatusConfig(taskStatus) : undefined;

  return (
    <div className="mb-6 flex items-start gap-3">
      <h1 className="min-w-0 flex-1 text-lg font-semibold text-text-dark text-left line-clamp-2">
        {title}
      </h1>
      {(hasPrevious || hasNext) && (
        <div className="mt-0.5 flex shrink-0 items-center gap-1">
          {hasPrevious && previousLabel && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9 border-0 bg-transparent p-0 text-[#0D7773] shadow-none hover:bg-transparent hover:text-[#0D7773]"
              onClick={onPrevious}
              disabled={previousDisabled}
              aria-label={previousLabel}
              title={previousLabel}
            >
              <ArrowLeft aria-hidden="true" className="size-5" />
            </Button>
          )}
          {hasNext && nextLabel && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9 border-0 bg-transparent p-0 text-[#0D7773] shadow-none hover:bg-transparent hover:text-[#0D7773]"
              onClick={onNext}
              disabled={nextDisabled}
              aria-label={nextLabel}
              title={nextLabel}
            >
              <ArrowRight aria-hidden="true" className="size-5" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
