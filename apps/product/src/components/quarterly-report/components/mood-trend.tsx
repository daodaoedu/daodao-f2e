"use client";

import { MOOD_OPTIONS } from "@/constants/mood";
import type { QuarterlyReportMoodPoint } from "../types";

interface MoodTrendProps {
  moodCurve: QuarterlyReportMoodPoint[];
}

export function MoodTrend({ moodCurve }: MoodTrendProps) {
  if (moodCurve.length === 0) return null;

  const first = moodCurve[0]!;
  const last = moodCurve[moodCurve.length - 1]!;
  const FirstEmoji = MOOD_OPTIONS.find((m) => m.id === first.mood)?.emoji;
  const LastEmoji = MOOD_OPTIONS.find((m) => m.id === last.mood)?.emoji;

  return (
    <div className="flex items-center gap-2">
      {FirstEmoji && <FirstEmoji className="size-6" />}
      <div className="h-px flex-1 border-t border-dashed border-[#8A9BA0]" />
      <span className="text-xs text-[#8A9BA0]">→</span>
      <div className="h-px flex-1 border-t border-dashed border-[#8A9BA0]" />
      {LastEmoji && <LastEmoji className="size-6" />}
    </div>
  );
}
