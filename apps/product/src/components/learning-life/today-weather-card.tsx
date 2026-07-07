"use client";

import { posthogCapture } from "@daodao/analytics";
import { Link } from "@daodao/i18n/navigation";
import { format } from "date-fns";
import { ChevronRight, Flame } from "lucide-react";
import { getCheckinStreak, getDaysSinceLastCheckin } from "./checkin-stats";
import { getIslandWeather } from "./island-weather";
import { learningLifeActions, useLearningLifeStore } from "./mock-store";

/** 島頁私有摘要卡 1：今日天氣（打卡狀態）→ 學習生活「今天」 */
export function TodayWeatherCard() {
  const { checkins, records } = useLearningLifeStore();
  const today = format(new Date(), "yyyy-MM-dd");
  const todayCheckedIn = checkins.some((c) => c.checkinDate === today);
  const streak = getCheckinStreak(checkins, today);
  const weather = getIslandWeather({
    todayCheckedIn,
    streak,
    daysSinceLastCheckin: getDaysSinceLastCheckin(checkins, today),
    todayEnergy: records[today]?.energy,
  });

  return (
    <Link
      href="/me/learning-life"
      onClick={() => {
        posthogCapture("island_summary_card_clicked", { card: "weather" });
        learningLifeActions.setActiveTab("today");
      }}
      className="flex items-center gap-3 rounded-2xl border border-[#E4EAE9] bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <span className="text-3xl">{weather.emoji}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-text-dark">島上天氣</p>
        <p className="truncate text-xs text-text-secondary">{weather.label}</p>
      </div>
      {streak > 0 && (
        <span className="flex shrink-0 items-center gap-1 text-xs text-[#FFA10B]">
          <Flame className="size-3.5" />
          {streak} 天
        </span>
      )}
      <ChevronRight className="size-4 shrink-0 text-text-secondary" />
    </Link>
  );
}
