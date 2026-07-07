import { cn } from "@daodao/ui/lib/utils";
import type { ElementType } from "react";

interface MetricPillProps {
  icon: ElementType;
  label: string;
  value: string;
  unit?: string;
  className?: string;
}

export function MetricPill({ icon: Icon, label, value, unit, className }: MetricPillProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl border border-[#E0E4E8] bg-white px-3 py-2",
        className
      )}
    >
      <Icon className="size-5" />
      <div className="flex flex-col">
        <span className="text-xs text-[#8A9BA0]">{label}</span>
        <span className="text-sm font-semibold text-[#2D3436]">
          {value}
          {unit && <span className="text-xs font-normal text-[#8A9BA0]"> {unit}</span>}
        </span>
      </div>
    </div>
  );
}
