import { describe, expect, it } from "vitest";
import { searchChallenges } from "../challenge-filter";

const challenges = [
  { id: 1, displayName: "每天通勤學英文", description: "21 天英文聽力", runStatus: "ongoing" },
  { id: 2, displayName: "早起讀書會", description: null, runStatus: "upcoming" },
  { id: 3, displayName: "Morning Pages", description: "每天寫三頁", runStatus: "ended" },
];

const ids = (list: { id: number }[]) => list.map((c) => c.id);

describe("searchChallenges", () => {
  it("全部、沒有關鍵字時列出所有挑戰", () => {
    expect(ids(searchChallenges(challenges, "", "all"))).toEqual([1, 2, 3]);
  });

  it("依狀態篩選只留該狀態", () => {
    expect(ids(searchChallenges(challenges, "", "upcoming"))).toEqual([2]);
    expect(ids(searchChallenges(challenges, "", "ended"))).toEqual([3]);
  });

  it("關鍵字比對名稱與介紹，不分大小寫、忽略前後空白", () => {
    expect(ids(searchChallenges(challenges, "英文", "all"))).toEqual([1]);
    expect(ids(searchChallenges(challenges, "  morning ", "all"))).toEqual([3]);
    expect(ids(searchChallenges(challenges, "三頁", "all"))).toEqual([3]);
  });

  it("關鍵字與狀態同時成立才列出", () => {
    expect(ids(searchChallenges(challenges, "英文", "ended"))).toEqual([]);
  });
});
