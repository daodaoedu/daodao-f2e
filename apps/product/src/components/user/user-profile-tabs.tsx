"use client";

import { RhythmInsightCard, TodayWeatherCard } from "@/components/learning-life";
import { PracticeSection } from "@/components/practice";

interface UserProfileTabsProps {
  targetUserId: string;
  isOwnProfile: boolean;
}

export function UserProfileTabs({ targetUserId, isOwnProfile }: UserProfileTabsProps) {
  return (
    <div className="mt-4">
      {isOwnProfile && (
        <div className="mb-4 flex flex-col gap-3">
          <TodayWeatherCard />
          <RhythmInsightCard />
        </div>
      )}
      <PracticeSection userId={targetUserId} />
    </div>
  );
}
