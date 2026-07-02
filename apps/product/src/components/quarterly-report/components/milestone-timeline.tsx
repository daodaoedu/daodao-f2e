"use client";

import { motion } from "motion/react";
import type { QuarterlyReportMilestone } from "../types";

interface MilestoneTimelineProps {
  milestones: QuarterlyReportMilestone[];
}

export function MilestoneTimeline({ milestones }: MilestoneTimelineProps) {
  return (
    <div className="relative pl-6">
      <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-[#E0E4E8]" />

      {milestones.map((milestone, i) => (
        <motion.div
          key={milestone.date}
          className="relative pb-6 last:pb-0"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: i * 0.1 }}
        >
          <div className="absolute -left-6 top-1.5 size-[18px] rounded-full border-2 border-white bg-[#16B9B3] shadow-sm" />

          <div>
            <span className="text-xs text-[#8A9BA0]">{formatDate(milestone.date)}</span>
            <h4 className="mt-0.5 text-sm font-semibold text-[#2D3436]">{milestone.title}</h4>
            <p className="mt-0.5 text-xs text-[#536166]">{milestone.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}
