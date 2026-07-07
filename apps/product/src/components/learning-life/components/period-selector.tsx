"use client";

import { cn } from "@daodao/ui/lib/utils";
import type { PeriodOption } from "../constants";
import { PERIOD_OPTIONS } from "../constants";

interface PeriodSelectorProps {
  value: PeriodOption;
  onChange: (period: PeriodOption) => void;
}

const PERIOD_LABELS: Record<PeriodOption, string> = {
  7: "7天",
  30: "30天",
  90: "90天",
};

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <div className="flex gap-1 rounded-lg bg-[#F5F7FA] p-1">
      {PERIOD_OPTIONS.map((period) => (
        <button
          type="button"
          key={period}
          onClick={() => onChange(period)}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            value === period
              ? "bg-white text-[#2D3436] shadow-sm"
              : "text-[#8A9BA0] hover:text-[#2D3436]"
          )}
        >
          {PERIOD_LABELS[period]}
        </button>
      ))}
    </div>
  );
}
