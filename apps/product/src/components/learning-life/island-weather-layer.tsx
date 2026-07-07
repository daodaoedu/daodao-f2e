"use client";

import { format } from "date-fns";
import { Cloud, CloudFog, Rainbow, Sparkles, Sun } from "lucide-react";
import type { ElementType } from "react";
import { getCheckinStreak, getDaysSinceLastCheckin } from "./checkin-stats";
import { getIslandWeather, type IslandWeatherKind } from "./island-weather";
import { useLearningLifeStore } from "./mock-store";

const WEATHER_ICONS: Record<IslandWeatherKind, ElementType> = {
  rainbow: Rainbow,
  sunny: Sun,
  cloudy: Cloud,
  overcast: CloudFog,
};

const WEATHER_COLORS: Record<IslandWeatherKind, string> = {
  rainbow: "text-fuchsia-400",
  sunny: "text-amber-400",
  cloudy: "text-slate-400",
  overcast: "text-slate-500",
};

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
  const WeatherIcon = WEATHER_ICONS[weather.kind];

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <WeatherIcon
        className={`absolute -top-2 -right-6 size-8 drop-shadow-sm ${WEATHER_COLORS[weather.kind]}`}
      />
      {weather.lively && (
        <Sparkles className="absolute -bottom-1 -left-4 size-5 animate-pulse text-amber-300" />
      )}
    </div>
  );
}
