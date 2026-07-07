import { describe, expect, it } from "vitest";
import {
  getCheckinStreak,
  getDailyCheckinCounts,
  getDaysSinceLastCheckin,
  getWeeklySummary,
} from "../checkin-stats";
import type { MockCheckin } from "../types";

function checkin(date: string): MockCheckin {
  return {
    id: date,
    practiceId: "p1",
    practiceTitle: "測試實踐",
    checkinDate: date,
    mood: "good",
    note: "",
    tags: [],
  };
}

describe("getCheckinStreak", () => {
  it("今天有打卡時從今天連續往回數", () => {
    const checkins = [checkin("2026-07-07"), checkin("2026-07-06"), checkin("2026-07-04")];
    expect(getCheckinStreak(checkins, "2026-07-07")).toBe(2);
  });

  it("今天沒打卡時從昨天起算", () => {
    const checkins = [checkin("2026-07-06"), checkin("2026-07-05")];
    expect(getCheckinStreak(checkins, "2026-07-07")).toBe(2);
  });

  it("沒有任何打卡回傳 0", () => {
    expect(getCheckinStreak([], "2026-07-07")).toBe(0);
  });
});

describe("getDaysSinceLastCheckin", () => {
  it("今天打卡回傳 0", () => {
    expect(getDaysSinceLastCheckin([checkin("2026-07-07")], "2026-07-07")).toBe(0);
  });

  it("最後打卡在 3 天前回傳 3", () => {
    expect(getDaysSinceLastCheckin([checkin("2026-07-04")], "2026-07-07")).toBe(3);
  });

  it("沒有任何打卡回傳 Infinity", () => {
    expect(getDaysSinceLastCheckin([], "2026-07-07")).toBe(Number.POSITIVE_INFINITY);
  });
});

describe("getDailyCheckinCounts", () => {
  it("依日期由舊到新回傳每天打卡數", () => {
    const checkins = [checkin("2026-07-07"), checkin("2026-07-07"), checkin("2026-07-06")];
    expect(getDailyCheckinCounts(checkins, "2026-07-07", 3)).toEqual([
      { date: "2026-07-05", count: 0 },
      { date: "2026-07-06", count: 1 },
      { date: "2026-07-07", count: 2 },
    ]);
  });
});

describe("getWeeklySummary", () => {
  it("計算近 7 天與前 7 天的打卡天數差", () => {
    const checkins = [
      checkin("2026-07-07"),
      checkin("2026-07-06"),
      checkin("2026-07-05"),
      checkin("2026-06-29"),
    ];
    const summary = getWeeklySummary(checkins, "2026-07-07");
    expect(summary.thisWeekDays).toBe(3);
    expect(summary.lastWeekDays).toBe(1);
    expect(summary.sentence).toContain("打卡了 3 天");
    expect(summary.sentence).toContain("多 2 天");
  });
});
