import { cn } from "@daodao/ui/lib/utils";

interface MetricPillProps {
  emoji: string;
  label: string;
  value: string;
  unit?: string;
  className?: string;
}

export function MetricPill({ emoji, label, value, unit, className }: MetricPillProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl border border-[#E0E4E8] bg-white px-3 py-2",
        className
      )}
    >
      <span className="text-lg">{emoji}</span>
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
