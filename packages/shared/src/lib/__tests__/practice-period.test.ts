import { describe, expect, it } from "vitest";
import { practiceEndDate } from "../practice-period";

const ymd = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

// daodao#295：mobile 實踐頁／建立第 2 步的結束日用 start + days，比 server practices.end_date 多一天
describe("practiceEndDate", () => {
  it("含頭尾共 durationDays 天：14 天挑戰 2026-10-09 起結束於 2026-10-22（= server end_date）", () => {
    expect(ymd(practiceEndDate(new Date(2026, 9, 9), 14))).toBe("2026-10-22");
  });

  it("mobile 以 new Date('YYYY-MM-DD') 解析（UTC 午夜）也維持同一個日曆日", () => {
    const start = new Date("2026-10-09");
    expect(practiceEndDate(start, 14).toISOString().slice(0, 10)).toBe("2026-10-22");
  });

  it("1 天的實踐開始日即結束日", () => {
    expect(ymd(practiceEndDate(new Date(2026, 9, 9), 1))).toBe("2026-10-09");
  });

  it("跨月", () => {
    expect(ymd(practiceEndDate(new Date(2026, 9, 25), 14))).toBe("2026-11-07");
  });
});
