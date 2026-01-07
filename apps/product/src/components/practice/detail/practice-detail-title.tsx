"use client";

import { getStatusBadgeConfig } from "@/constants/task-status";
import { ArrowLeftOutlineSvg, ArrowRightOutlineSvg } from "@daodao/assets";
import { Badge } from "@daodao/ui/components/badge";
import { Button } from "@daodao/ui/components/button";
import { cn } from "@daodao/ui/lib/utils";

interface PracticeDetailTitleProps {
  title: string;
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
}

export const PracticeDetailTitle = ({
  title,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
}: PracticeDetailTitleProps) => {
  // TODO: 從 API 取得實踐的 status
  const status = "in-progress";
  const statusInfo = getStatusBadgeConfig(status);

  return (
    <div className="flex items-center gap-2 mb-6 h-[84px]">
      <Button
        variant="white"
        size="icon"
        onClick={onPrevious}
        disabled={!hasPrevious}
        aria-label="上一個實踐"
        className={cn(
          "shadow-sm",
          !hasPrevious && "opacity-50 cursor-not-allowed"
        )}
        animation="none"
      >
        <ArrowLeftOutlineSvg className="size-6" />
      </Button>

      <div className="flex-1 flex flex-col items-center gap-1">
        {statusInfo && (
          <Badge variant={statusInfo.variant} size="sm" className="w-fit">
            {statusInfo.label}
          </Badge>
        )}
        <h1 className="text-lg font-semibold text-text-dark text-center line-clamp-2 h-[56px]">
          {title}
        </h1>
      </div>

      <Button
        variant="white"
        size="icon"
        onClick={onNext}
        disabled={!hasNext}
        aria-label="下一個實踐"
        className={cn("shadow-sm", !hasNext && "opacity-50 cursor-not-allowed")}
        animation="none"
      >
        <ArrowRightOutlineSvg className="size-6" />
      </Button>
    </div>
  );
};
