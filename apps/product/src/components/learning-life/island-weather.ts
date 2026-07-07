export type IslandWeatherKind = "sunny" | "rainbow" | "cloudy" | "overcast";

export interface IslandWeatherInput {
  /** 今天是否已打卡 */
  todayCheckedIn: boolean;
  /** 連續打卡天數（含今天） */
  streak: number;
  /** 距最近一次打卡的天數（0 = 今天） */
  daysSinceLastCheckin: number;
  /** 今日精力 1-5，未記錄則 undefined */
  todayEnergy?: number;
}

export interface IslandWeatherState {
  kind: IslandWeatherKind;
  /** 島上小動物是否有活力（今日精力 >= 4） */
  lively: boolean;
  emoji: string;
  label: string;
}

// 文案原則：中斷不責備。多雲/陰天是「島在等你」的歡迎語，
// 不是「你沒打卡」的指責——中斷後回來的那一刻是最脆弱的時刻，要接住不要推開
const WEATHER_META: Record<IslandWeatherKind, { emoji: string; label: string }> = {
  rainbow: { emoji: "🌈", label: "連續打卡中，島上出現彩虹！" },
  sunny: { emoji: "☀️", label: "今天已打卡，島上晴朗" },
  cloudy: { emoji: "⛅", label: "島上飄來幾朵雲，今天的故事還沒開始" },
  overcast: { emoji: "🌫️", label: "島上有點霧，等你回來就會散" },
};

/** 天氣規則（spec §7）：打卡狀態 → 島景天氣。純函式，header 與摘要卡共用 */
export function getIslandWeather(input: IslandWeatherInput): IslandWeatherState {
  const { todayCheckedIn, streak, daysSinceLastCheckin, todayEnergy } = input;
  let kind: IslandWeatherKind;
  if (todayCheckedIn && streak >= 7) kind = "rainbow";
  else if (todayCheckedIn) kind = "sunny";
  else if (daysSinceLastCheckin >= 3) kind = "overcast";
  else kind = "cloudy";
  return { kind, lively: (todayEnergy ?? 0) >= 4, ...WEATHER_META[kind] };
}
