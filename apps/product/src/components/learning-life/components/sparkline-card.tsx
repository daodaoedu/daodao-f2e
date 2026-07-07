import { Card } from "@daodao/ui/components/card";
import type { MetricConfig } from "../types";

interface SparklineCardProps {
  config: MetricConfig;
  value: string;
  data: Array<{ date: string; value: number }>;
  trend?: "up" | "down" | "flat";
}

function buildPolyline(data: Array<{ value: number }>, width: number, height: number): string {
  if (data.length < 2) return "";
  const max = Math.max(...data.map((d) => d.value));
  const min = Math.min(...data.map((d) => d.value));
  const range = max - min || 1;
  const padding = 4;

  return data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = padding + ((max - d.value) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");
}

const TREND_ICONS: Record<string, string> = {
  up: "↑",
  down: "↓",
  flat: "→",
};

const TREND_LABELS: Record<string, string> = {
  up: "上升",
  down: "下降",
  flat: "持平",
};

export function SparklineCard({ config, value, data, trend = "flat" }: SparklineCardProps) {
  const polyline = buildPolyline(data, 120, 40);
  const gradientId = `sparkline-${config.key}`;

  return (
    <Card className="border-[#E0E4E8] p-4" style={{ backgroundColor: config.bgColor }}>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <config.icon className="size-4" />
          <span className="text-xs text-[#8A9BA0]">{config.label}</span>
        </div>
        <span className="text-xs text-[#8A9BA0]">
          {TREND_ICONS[trend]} {TREND_LABELS[trend] ?? "持平"}
        </span>
      </div>

      <div className="mb-2 text-xl font-bold text-[#2D3436]">
        {value}
        {config.unit && (
          <span className="ml-1 text-xs font-normal text-[#8A9BA0]">{config.unit}</span>
        )}
      </div>

      {polyline && (
        <svg
          viewBox="0 0 120 40"
          className="h-10 w-full"
          preserveAspectRatio="none"
          role="img"
          aria-label="趨勢圖"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={config.color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={config.color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <polygon points={`0,40 ${polyline} 120,40`} fill={`url(#${gradientId})`} />
          <polyline
            points={polyline}
            fill="none"
            stroke={config.color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </Card>
  );
}
