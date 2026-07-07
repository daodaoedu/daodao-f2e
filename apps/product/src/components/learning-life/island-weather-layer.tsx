"use client";

import { format } from "date-fns";
import { getCheckinStreak, getDaysSinceLastCheckin } from "./checkin-stats";
import { getIslandWeather } from "./island-weather";
import { useLearningLifeStore } from "./mock-store";

/**
 * 島景天氣層：疊加在島景 Lottie 上，依打卡狀態顯示天氣（僅島主可見）。
 * 讓島「活起來」— 島的樣貌反映學習生活（spec 原則三）。
 */
export function IslandWeatherLayer() {
  const { checkins, records } = useLearningLifeStore();
  const today = format(new Date(), "yyyy-MM-dd");
  const todayCheckedIn = checkins.some((c) => c.checkinDate === today);
  const weather = getIslandWeather({
    todayCheckedIn,
    streak: getCheckinStreak(checkins, today),
    daysSinceLastCheckin: getDaysSinceLastCheckin(checkins, today),
    todayEnergy: records[today]?.energy,
  });

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <span className="absolute -top-2 -right-6 text-3xl drop-shadow-sm">{weather.emoji}</span>
      {weather.lively && (
        <span className="absolute -bottom-1 -left-4 animate-pulse text-xl">✨</span>
      )}
    </div>
  );
}
