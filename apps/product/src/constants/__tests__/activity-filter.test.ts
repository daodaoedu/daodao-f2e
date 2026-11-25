import type { ActivitySummaryType } from "@daodao/api";
import { describe, expect, it } from "vitest";
import { searchActivities } from "../activity-filter";

const activity = (overrides: Partial<ActivitySummaryType>) =>
  ({
    id: 0,
    displayName: "",
    tagline: null,
    description: null,
    location: null,
    organizationName: null,
    host: { name: "島民", userId: null, avatar: null },
    runStatus: "upcoming",
    canJoin: true,
    feeType: "free",
    feeAmount: null,
    ...overrides,
  }) as unknown as ActivitySummaryType;

const activities = [
  activity({
    id: 1,
    displayName: "英文讀書會",
    runStatus: "upcoming",
    canJoin: true,
    feeType: "free",
  }),
  activity({ id: 2, displayName: "寫作課", runStatus: "ongoing", canJoin: false, feeType: "paid" }),
  activity({
    id: 3,
    displayName: "Morning Run",
    runStatus: "ended",
    canJoin: false,
    feeType: "free",
  }),
  activity({ id: 4, displayName: "攝影", runStatus: "ongoing", canJoin: true, feeType: "free" }),
];

const ids = (list: ActivitySummaryType[]) => list.map((a) => a.id);

describe("searchActivities（探索活動課程篩選，daodao#567 下拉選單共用）", () => {
  it("開放報名＝可加入且還沒結束", () => {
    expect(ids(searchActivities(activities, "", "open", null))).toEqual([1, 4]);
  });

  it("狀態與費用同時成立才列出", () => {
    expect(ids(searchActivities(activities, "", "ended", "free"))).toEqual([3]);
    expect(ids(searchActivities(activities, "", "ongoing", "paid"))).toEqual([2]);
    expect(ids(searchActivities(activities, "", "ended", "paid"))).toEqual([]);
  });

  it("關鍵字不分大小寫，比對名稱與發起人", () => {
    expect(ids(searchActivities(activities, " morning ", "all", null))).toEqual([3]);
    expect(ids(searchActivities(activities, "島民", "all", "paid"))).toEqual([2]);
  });
});
