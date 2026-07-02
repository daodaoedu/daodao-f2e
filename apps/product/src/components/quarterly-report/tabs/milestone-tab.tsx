"use client";

import { MilestoneTimeline } from "../components/milestone-timeline";
import type { QuarterlyReportData } from "../types";

interface MilestoneTabProps {
  data: QuarterlyReportData;
}

export function MilestoneTab({ data }: MilestoneTabProps) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <h3 className="mb-4 text-sm font-bold text-[#2D3436]">成就里程碑</h3>
      <MilestoneTimeline milestones={data.milestones} />
    </div>
  );
}
