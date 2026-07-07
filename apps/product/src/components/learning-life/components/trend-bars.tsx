import { cn } from "@daodao/ui/lib/utils";

interface TrendBarsProps {
  data: Array<{ date: string; value: number | null }>;
  max: number;
  color?: string;
  className?: string;
}

/** 迷你長條圖：null（未記錄）顯示為淡色矮格 */
export function TrendBars({ data, max, color = "#16B9B3", className }: TrendBarsProps) {
  return (
    <div className={cn("flex h-10 items-end gap-1", className)}>
      {data.map((d) => (
        <div
          key={d.date}
          className="flex-1 rounded-sm"
          style={{
            height: d.value ? `${Math.max(15, (d.value / max) * 100)}%` : "8%",
            backgroundColor: d.value ? color : "rgba(0,0,0,0.08)",
          }}
        />
      ))}
    </div>
  );
}
