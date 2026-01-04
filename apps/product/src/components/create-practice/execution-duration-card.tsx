"use client";

import { IslandSvg } from "@daodao/assets";
import { format, addDays, parse } from "date-fns";
import type { ManualPracticeFormValues } from "./manual/schema";

interface ExecutionDurationCardProps {
  durationDays: ManualPracticeFormValues["durationDays"];
  startDate: ManualPracticeFormValues["startDate"];
}

export const ExecutionDurationCard = ({
  durationDays,
  startDate,
}: ExecutionDurationCardProps) => {
  const start = parse(startDate, "yyyy-MM-dd", new Date());
  const days = Number.parseInt(durationDays, 10);
  const end = addDays(start, days);

  return (
    <div className="relative bg-white rounded-lg p-4 flex flex-col justify-between">
      {/* Cloud Illustration Background */}
      <div className="absolute -bottom-[10px] -right-[30px]">
        <IslandSvg width={86} height={31} />
      </div>
      <div>
        <h3 className="text-xs text-text-dark">執行時長</h3>
        <div className="flex items-baseline gap-0.5">
          <div className="text-lg leading-7 font-medium text-logo-orange">
            {durationDays}
          </div>
          <div className="text-xs text-text-dark">天</div>
        </div>
      </div>
      <div>
        <span className="text-xs leading-none text-text-dark">開始日</span>
        <div className="text-sm leading-none text-logo-cyan">
          {format(start, "yyyy/MM/dd")}
        </div>
      </div>
      <div>
        <span className="text-xs leading-none text-text-dark">結束日</span>
        <div className="text-sm leading-none text-logo-cyan">
          {format(end, "yyyy/MM/dd")}
        </div>
      </div>
    </div>
  );
};

