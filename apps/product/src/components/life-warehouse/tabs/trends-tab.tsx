"use client";

import { Card } from "@daodao/ui/components/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@daodao/ui/components/chart";
import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { SectionHeader, TagCloud } from "../components";
import type { DailyRecord } from "../types";
import { calculateTagFrequency, getDateLabel, getSparklineData } from "../utils";

interface TrendsTabProps {
  records: DailyRecord[];
}

export function TrendsTab({ records }: TrendsTabProps) {
  const moodEnergyData = useMemo(() => {
    return getSparklineData(records, "mood").map((d, i) => {
      const energyData = getSparklineData(records, "energy");
      return {
        date: getDateLabel(d.date),
        mood: d.value,
        energy: energyData[i]?.value ?? 0,
      };
    });
  }, [records]);

  const sleepData = useMemo(
    () =>
      getSparklineData(records, "sleep").map((d) => ({
        date: getDateLabel(d.date),
        sleep: d.value,
      })),
    [records]
  );

  const stepsData = useMemo(
    () =>
      getSparklineData(records, "steps").map((d) => ({
        date: getDateLabel(d.date),
        steps: d.value,
      })),
    [records]
  );

  const coffeeData = useMemo(
    () =>
      getSparklineData(records, "coffee").map((d) => ({
        date: getDateLabel(d.date),
        coffee: d.value,
      })),
    [records]
  );

  const tagFrequency = useMemo(() => calculateTagFrequency(records), [records]);

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-[#E0E4E8] p-4">
        <SectionHeader title="😊 心情 & 🔋 精力" />
        <div className="mt-3">
          <ChartContainer
            config={{
              mood: { label: "心情", color: "#F472B6" },
              energy: { label: "精力", color: "#FBBF24" },
            }}
            className="aspect-[3/1] w-full"
          >
            <LineChart data={moodEnergyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                fontSize={10}
                interval="preserveStartEnd"
              />
              <YAxis domain={[0, 9]} hide />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="mood"
                stroke="var(--color-mood)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="energy"
                stroke="var(--color-energy)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </div>
      </Card>

      <Card className="border-[#E0E4E8] p-4">
        <SectionHeader title="😴 睡眠時數" />
        <div className="mt-3">
          <ChartContainer
            config={{ sleep: { label: "睡眠", color: "#6366F1" } }}
            className="aspect-[3/1] w-full"
          >
            <AreaChart data={sleepData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                fontSize={10}
                interval="preserveStartEnd"
              />
              <YAxis domain={[4, 10]} hide />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="sleep"
                stroke="var(--color-sleep)"
                fill="var(--color-sleep)"
                fillOpacity={0.15}
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </Card>

      <Card className="border-[#E0E4E8] p-4">
        <SectionHeader title="👟 步數" />
        <div className="mt-3">
          <ChartContainer
            config={{ steps: { label: "步數", color: "#16B9B3" } }}
            className="aspect-[3/1] w-full"
          >
            <AreaChart data={stepsData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                fontSize={10}
                interval="preserveStartEnd"
              />
              <YAxis hide />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="steps"
                stroke="var(--color-steps)"
                fill="var(--color-steps)"
                fillOpacity={0.15}
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </Card>

      <Card className="border-[#E0E4E8] p-4">
        <SectionHeader title="☕ 咖啡" />
        <div className="mt-3">
          <ChartContainer
            config={{ coffee: { label: "咖啡", color: "#92400E" } }}
            className="aspect-[3/1] w-full"
          >
            <LineChart data={coffeeData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                fontSize={10}
                interval="preserveStartEnd"
              />
              <YAxis domain={[0, 5]} hide />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="coffee"
                stroke="var(--color-coffee)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </div>
      </Card>

      {tagFrequency.length > 0 && (
        <section>
          <SectionHeader title="🏷️ 標籤頻率分佈" />
          <div className="mt-3">
            <TagCloud tags={tagFrequency} />
          </div>
        </section>
      )}
    </div>
  );
}
