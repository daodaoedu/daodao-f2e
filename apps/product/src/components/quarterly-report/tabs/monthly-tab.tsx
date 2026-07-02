"use client";

import { motion } from "motion/react";
import type { QuarterlyReportData } from "../types";

interface MonthlyTabProps {
  data: QuarterlyReportData;
}

export function MonthlyTab({ data }: MonthlyTabProps) {
  return (
    <div className="space-y-4">
      {data.months.map((month, i) => (
        <motion.div
          key={month.month}
          className="rounded-xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.1 }}
        >
          <div className="mb-3 flex items-baseline justify-between">
            <h3 className="text-lg font-bold text-[#2D3436]">{month.month} 月</h3>
            <div className="flex gap-3 text-xs text-[#536166]">
              <span>{month.activeDays} 天活躍</span>
              <span>·</span>
              <span>{month.topics} 個主題</span>
            </div>
          </div>
          <ul className="space-y-1.5">
            {month.highlights.map((highlight) => (
              <li key={highlight} className="flex items-start gap-2">
                <div className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#16B9B3]" />
                <span className="text-sm text-[#536166]">{highlight}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      ))}
    </div>
  );
}
