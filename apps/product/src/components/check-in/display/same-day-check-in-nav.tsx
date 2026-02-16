"use client";

import { useSafeRouter } from "@daodao/ui/hooks/use-safe-router";
import { Button } from "@daodao/ui/components/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback } from "react";

interface ISameDayCheckInNavProps {
  /** 同一天所有打卡的 ID 陣列（按 createdAt 排序） */
  sameDayCheckInIds: string[];
  /** 目前顯示的打卡在同日中的索引（0-based） */
  currentIndex: number;
  practiceId: string;
}

export const SameDayCheckInNav = ({
  sameDayCheckInIds,
  currentIndex,
  practiceId,
}: ISameDayCheckInNavProps) => {
  const router = useSafeRouter();
  const total = sameDayCheckInIds.length;

  if (total <= 1) return null;

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < total - 1;

  const handlePrev = useCallback(() => {
    if (hasPrev) {
      router.push(`/practices/${practiceId}/check-ins/${sameDayCheckInIds[currentIndex - 1]}`);
    }
  }, [hasPrev, router, practiceId, sameDayCheckInIds, currentIndex]);

  const handleNext = useCallback(() => {
    if (hasNext) {
      router.push(`/practices/${practiceId}/check-ins/${sameDayCheckInIds[currentIndex + 1]}`);
    }
  }, [hasNext, router, practiceId, sameDayCheckInIds, currentIndex]);

  return (
    <div className="relative flex items-center justify-between mb-6 pb-5">
      {/* 左箭頭 */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handlePrev}
        disabled={!hasPrev}
        className="size-12 rounded-full bg-white text-logo-cyan shadow-md hover:bg-white/90 disabled:bg-white/20 disabled:text-logo-cyan/40 disabled:shadow-none"
        aria-label="上一筆打卡"
        animation="none"
      >
        <ChevronLeft className="size-6" />
      </Button>

      {/* 中間指示器 */}
      <span className="text-white text-lg font-medium tabular-nums">
        {currentIndex + 1} / {total}
      </span>

      {/* 右箭頭 */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleNext}
        disabled={!hasNext}
        className="size-12 rounded-full bg-white text-logo-cyan shadow-md hover:bg-white/90 disabled:bg-white/20 disabled:text-logo-cyan/40 disabled:shadow-none"
        aria-label="下一筆打卡"
        animation="none"
      >
        <ChevronRight className="size-6" />
      </Button>
    </div>
  );
};
