"use client";

import { LearningRadarChart } from "../components/learning-radar-chart";
import { MoodCurveChart } from "../components/mood-curve-chart";
import type { QuarterlyReportData } from "../types";

interface GrowthTabProps {
  data: QuarterlyReportData;
}

export function GrowthTab({ data }: GrowthTabProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h3 className="mb-2 text-sm font-bold text-[#2D3436]">學習領域雷達圖</h3>
        <LearningRadarChart dimensions={data.learningRadar} />
      </div>

      <div className="rounded-xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h3 className="mb-2 text-sm font-bold text-[#2D3436]">心情變化曲線</h3>
        <p className="mb-3 text-xs text-[#8A9BA0]">從焦慮不安到自信滿滿的 12 週</p>
        <MoodCurveChart moodCurve={data.moodCurve} />
      </div>
    </div>
  );
}
