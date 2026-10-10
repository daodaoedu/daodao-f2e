import { describe, expect, it } from "vitest";
import { parseLocalDate, practiceEndDate, resolvePracticeDurationDays } from "../practice-period";

const ymd = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

// daodao#299：實踐頁只認 7／14／21／30，其他天數一律變成 7 天。
// 從共同挑戰複製出的實踐天數由挑戰起訖日決定，可以是 1～上限之間任何天數。
describe("resolvePracticeDurationDays", () => {
  it.each([7, 14, 21, 30])("建立流程的預設天數 %i 照原樣顯示", (days) => {
    expect(resolvePracticeDurationDays({ durationDays: days })).toBe(days);
  });

  it.each([1, 10, 50, 90])("非預設天數 %i 照 API 顯示，不被改成 7", (days) => {
    expect(resolvePracticeDurationDays({ durationDays: days })).toBe(days);
  });

  it("50 天挑戰實踐的結束日與 API endDate 同一天", () => {
    const api = { durationDays: 50, startDate: "2026-10-01", endDate: "2026-11-19" };
    const days = resolvePracticeDurationDays(api);
    const start = parseLocalDate(api.startDate);
    expect(days).toBe(50);
    expect(start).not.toBeNull();
    if (!start || days === null) return;
    expect(ymd(practiceEndDate(start, days))).toBe(api.endDate);
  });

  it("90 天實踐的結束日與 API endDate 同一天", () => {
    const api = { durationDays: 90, startDate: "2026-10-10", endDate: "2027-01-07" };
    const days = resolvePracticeDurationDays(api);
    const start = parseLocalDate(api.startDate);
    expect(days).toBe(90);
    if (!start || days === null) throw new Error("expected start and days");
    expect(ymd(practiceEndDate(start, days))).toBe(api.endDate);
  });

  it("API 沒給天數時由起訖日（含頭尾）推回天數", () => {
    expect(
      resolvePracticeDurationDays({
        durationDays: null,
        startDate: "2026-10-01",
        endDate: "2026-11-19",
      })
    ).toBe(50);
  });

  it("天數與起訖日都無法判斷時回傳 null，不捏造 7 天", () => {
    expect(resolvePracticeDurationDays({})).toBeNull();
    expect(resolvePracticeDurationDays({ durationDays: 0 })).toBeNull();
    expect(resolvePracticeDurationDays({ durationDays: 2.5 })).toBeNull();
    expect(
      resolvePracticeDurationDays({ startDate: "2026-10-10", endDate: "2026-10-01" })
    ).toBeNull();
  });
});
