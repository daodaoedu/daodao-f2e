"use client";

import { IslandSvg } from "@daodao/assets";
import { addDays, format, isValid, parse } from "date-fns";
import type { ManualPracticeFormValues } from "../create/manual/schema";

interface ExecutionDurationCardProps {
  durationDays: ManualPracticeFormValues["durationDays"] | number;
  startDate: ManualPracticeFormValues["startDate"] | string | null;
  // 詳情頁專用屬性
  currentProgress?: number; // 當前進度（用於計算剩餘天數）
  showRemaining?: boolean; // 是否顯示剩餘天數模式
}

export const ExecutionDurationCard = ({
  durationDays,
  startDate,
  currentProgress = 0,
  showRemaining = false,
}: ExecutionDurationCardProps) => {
  const days = typeof durationDays === "string" ? Number.parseInt(durationDays, 10) : durationDays;

  const start =
    startDate && isValid(parse(startDate, "yyyy-MM-dd", new Date()))
      ? parse(startDate, "yyyy-MM-dd", new Date())
      : null;
  const end = start ? addDays(start, days) : null;
  const remainingDays = showRemaining ? Math.max(0, days - currentProgress) : days;

  return (
    <div className="relative bg-white rounded-lg p-4 flex flex-col justify-between min-h-[120px]">
      {/* Cloud Illustration Background */}
      <div className="absolute -bottom-[10px] -right-[30px]">
        <IslandSvg width={86} height={31} />
      </div>
      {showRemaining ? (
        <div>
          <h3 className="text-xs text-text-dark">剩餘</h3>
          <div className="flex items-baseline gap-0.5">
            <div className="text-lg font-medium text-logo-orange">{remainingDays}</div>
            <div className="text-xs text-text-dark">天</div>
            <div className="text-xs text-text-dark">/ 總共</div>
            <div className="text-xs text-text-dark">{days}</div>
            <div className="text-xs text-text-dark">天</div>
          </div>
        </div>
      ) : (
        <div>
          <h3 className="text-xs text-text-dark">執行時長</h3>
          <div className="flex items-baseline gap-0.5">
            <div className="text-lg font-medium text-logo-orange">{durationDays}</div>
            <div className="text-xs text-text-dark">天</div>
          </div>
        </div>
      )}
      {start && (
        <div>
          <div className="text-xs text-text-dark">開始日</div>
          <div className="text-sm text-logo-cyan">{format(start, "yyyy/MM/dd")}</div>
        </div>
      )}
      {end && (
        <div>
          <div className="text-xs text-text-dark">結束日</div>
          <div className="text-sm text-logo-cyan">{format(end, "yyyy/MM/dd")}</div>
        </div>
      )}
    </div>
  );
};
