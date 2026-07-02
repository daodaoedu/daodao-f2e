"use client";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@daodao/ui/components/chart";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import type { QuarterlyReportMoodPoint } from "../types";

interface MoodCurveChartProps {
  moodCurve: QuarterlyReportMoodPoint[];
}

const chartConfig = {
  score: { label: "心情", color: "#16B9B3" },
} satisfies ChartConfig;

export function MoodCurveChart({ moodCurve }: MoodCurveChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-[200px] w-full">
      <LineChart data={moodCurve} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F4" />
        <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#8A9BA0" }} tickFormatter={(w: number) => `W${w}`} />
        <YAxis tick={{ fontSize: 11, fill: "#8A9BA0" }} domain={[0, 100]} tickCount={5} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line
          type="monotone"
          dataKey="score"
          stroke="var(--color-score)"
          strokeWidth={2}
          dot={{ r: 4, fill: "var(--color-score)" }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ChartContainer>
  );
}
