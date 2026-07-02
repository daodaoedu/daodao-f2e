"use client";

import { motion } from "motion/react";
import type { QuarterlyReportAction } from "../types";

interface ActionCardProps {
  action: QuarterlyReportAction;
  index: number;
}

export function ActionCard({ action, index }: ActionCardProps) {
  return (
    <motion.div
      className="flex gap-3 rounded-xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#E8F8F7] text-sm font-bold text-[#16B9B3]">
        {index + 1}
      </div>
      <div>
        <h4 className="text-sm font-semibold text-[#2D3436]">{action.title}</h4>
        <p className="mt-0.5 text-xs text-[#536166]">{action.description}</p>
      </div>
    </motion.div>
  );
}
