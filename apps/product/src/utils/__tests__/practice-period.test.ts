import { describe, expect, it } from "vitest";
import { practiceEndDate, practiceRemainingDays } from "../practice-period";

const ymd = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

describe("practiceEndDate", () => {
  // daodao#295：挑戰 2026-10-09 起 14 天、結束 2026-10-22；複製出的實踐頁卻顯示 2026/10/23
  it("含頭尾共 durationDays 天：結束日 = 開始日 + 天數 − 1（與 server practices.end_date 一致）", () => {
    expect(ymd(practiceEndDate(new Date(2026, 9, 9), 14))).toBe("2026-10-22");
  });

  it("1 天的實踐開始日即結束日", () => {
    expect(ymd(practiceEndDate(new Date(2026, 9, 9), 1))).toBe("2026-10-09");
  });

  it("跨月", () => {
    expect(ymd(practiceEndDate(new Date(2026, 9, 25), 14))).toBe("2026-11-07");
  });
});

describe("practiceRemainingDays", () => {
  const start = new Date(2026, 9, 9);

  // daodao#295 review 2：與 mobile 統一為「今天到結束日的日曆日數（含頭尾）」；
  // 舊算法開始日 10 點顯示 13（mobile 顯示 14），兩端不一致
  it("開始日當天剩總天數（與 mobile 一致）", () => {
    expect(practiceRemainingDays(start, 14, new Date(2026, 9, 9, 10))).toBe(14);
  });

  it("開始前不超過總天數", () => {
    expect(practiceRemainingDays(start, 14, new Date(2026, 9, 1, 10))).toBe(14);
  });

  it("結束後為 0", () => {
    expect(practiceRemainingDays(start, 14, new Date(2026, 10, 30, 10))).toBe(0);
  });
});
