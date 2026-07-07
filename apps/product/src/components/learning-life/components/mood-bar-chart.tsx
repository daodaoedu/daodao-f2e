"use client";

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@daodao/ui/components/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { DailyRecord } from "../types";
import { getDateLabel, getMoodColor, getMoodEmoji } from "../utils";

interface MoodBarChartProps {
  records: DailyRecord[];
}

export function MoodBarChart({ records }: MoodBarChartProps) {
  const data = [...records]
    .reverse()
    .slice(-30)
    .map((r) => ({
      date: getDateLabel(r.date),
      mood: r.mood,
      fill: getMoodColor(r.mood),
      emoji: getMoodEmoji(r.mood),
    }));

  const chartConfig = {
    mood: { label: "心情", color: "#16B9B3" },
  };

  return (
    <ChartContainer config={chartConfig} className="aspect-[3/1] w-full">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          fontSize={10}
          interval="preserveStartEnd"
        />
        <YAxis domain={[0, 9]} hide />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(value, payload) => {
                const item = payload?.[0]?.payload as { emoji?: string } | undefined;
                return `${value} ${item?.emoji ?? ""}`;
              }}
            />
          }
        />
        <Bar dataKey="mood" radius={[4, 4, 0, 0]} maxBarSize={12} />
      </BarChart>
    </ChartContainer>
  );
}
