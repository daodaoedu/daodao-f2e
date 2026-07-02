"use client";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@daodao/ui/components/chart";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import type { QuarterlyReportLearningDimension } from "../types";

interface LearningRadarChartProps {
  dimensions: QuarterlyReportLearningDimension[];
}

const chartConfig = {
  score: { label: "掌握度", color: "#16B9B3" },
} satisfies ChartConfig;

export function LearningRadarChart({ dimensions }: LearningRadarChartProps) {
  return (
    <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[280px]">
      <RadarChart data={dimensions}>
        <ChartTooltip content={<ChartTooltipContent />} />
        <PolarGrid stroke="#E0E4E8" />
        <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11, fill: "#536166" }} />
        <Radar dataKey="score" fill="var(--color-score)" fillOpacity={0.2} stroke="var(--color-score)" strokeWidth={2} />
      </RadarChart>
    </ChartContainer>
  );
}
