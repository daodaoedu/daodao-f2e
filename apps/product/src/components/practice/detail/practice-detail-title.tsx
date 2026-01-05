"use client";

import { ArrowLeftOutlineSvg, ArrowRightOutlineSvg } from "@daodao/assets";
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
  return (
    <div className="flex items-center gap-2 mb-12 h-[56px]">
      <Button
        variant="white"
        size="icon"
        onClick={onPrevious}
        disabled={!hasPrevious}
        aria-label="上一個實踐"
        className={cn("shadow-sm", !hasPrevious && "opacity-50 cursor-not-allowed")}
        animation="none"
      >
        <ArrowLeftOutlineSvg className="size-6" />
      </Button>

      <h1 className="flex-1 text-lg font-semibold text-text-dark text-center line-clamp-2">
        {title}
      </h1>

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
