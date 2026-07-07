import { describe, expect, it } from "vitest";
import { getIslandWeather } from "../island-weather";

describe("getIslandWeather", () => {
  it("今天已打卡且連續 7 天以上 → 彩虹", () => {
    expect(
      getIslandWeather({ todayCheckedIn: true, streak: 7, daysSinceLastCheckin: 0 }).kind
    ).toBe("rainbow");
  });

  it("今天已打卡但未達 7 天 → 晴天", () => {
    expect(
      getIslandWeather({ todayCheckedIn: true, streak: 3, daysSinceLastCheckin: 0 }).kind
    ).toBe("sunny");
  });

  it("1-2 天沒打卡 → 多雲", () => {
    expect(
      getIslandWeather({ todayCheckedIn: false, streak: 0, daysSinceLastCheckin: 1 }).kind
    ).toBe("cloudy");
    expect(
      getIslandWeather({ todayCheckedIn: false, streak: 0, daysSinceLastCheckin: 2 }).kind
    ).toBe("cloudy");
  });

  it("3 天以上沒打卡 → 陰天", () => {
    expect(
      getIslandWeather({ todayCheckedIn: false, streak: 0, daysSinceLastCheckin: 3 }).kind
    ).toBe("overcast");
  });

  it("今日精力 >= 4 → lively", () => {
    const base = { todayCheckedIn: true, streak: 1, daysSinceLastCheckin: 0 };
    expect(getIslandWeather({ ...base, todayEnergy: 4 }).lively).toBe(true);
    expect(getIslandWeather({ ...base, todayEnergy: 3 }).lively).toBe(false);
    expect(getIslandWeather(base).lively).toBe(false);
  });
});
