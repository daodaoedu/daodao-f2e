import { Badge } from "@daodao/ui/components/badge";
import { Card } from "@daodao/ui/components/card";
import { cn } from "@daodao/ui/lib/utils";
import { STRENGTH_COLORS, STRENGTH_LABELS } from "../constants";
import type { Correlation } from "../types";

interface CorrelationCardProps {
  correlation: Correlation;
  showScatter?: boolean;
}

export function CorrelationCard({ correlation, showScatter = false }: CorrelationCardProps) {
  const { metricA, metricB, rValue, strength, direction, description, scatterData } = correlation;
  const strengthColor = STRENGTH_COLORS[strength];

  return (
    <Card className="overflow-hidden border-[#E0E4E8] p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <metricA.icon className="size-4" />
          <span className="text-xs text-[#8A9BA0]">{metricA.label}</span>
          <span className="text-[#8A9BA0]">×</span>
          <metricB.icon className="size-4" />
          <span className="text-xs text-[#8A9BA0]">{metricB.label}</span>
        </div>
        <Badge
          size="xs"
          className="border-none font-medium"
          style={{
            color: strengthColor.text,
            backgroundColor: strengthColor.bg,
          }}
        >
          {STRENGTH_LABELS[strength]}
        </Badge>
      </div>

      <div className="mb-2 flex items-baseline gap-2">
        <span
          className={cn(
            "text-lg font-bold",
            direction === "positive" ? "text-[#16A34A]" : "text-[#EF4444]"
          )}
        >
          r = {rValue > 0 ? "+" : ""}
          {rValue.toFixed(2)}
        </span>
        <span className="text-xs text-[#8A9BA0]">
          {direction === "positive" ? "正相關" : "負相關"}
        </span>
      </div>

      <p className="text-xs leading-relaxed text-[#636E72]">{description}</p>

      {showScatter && scatterData && scatterData.length > 0 && (
        <div className="mt-3">
          <svg viewBox="0 0 200 100" className="h-20 w-full" role="img" aria-label="散佈圖">
            {scatterData.map((point, i) => (
              <circle
                key={`${point.x}-${point.y}-${i}`}
                cx={point.x}
                cy={point.y}
                r="3"
                fill={direction === "positive" ? "#16B9B3" : "#EF4444"}
                opacity={0.5}
              />
            ))}
          </svg>
        </div>
      )}
    </Card>
  );
}
