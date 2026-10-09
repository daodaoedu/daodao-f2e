import { afterEach, describe, expect, it } from "vitest";
import { parseLocalDate, practiceEndDate, practiceRemainingDays } from "../practice-period";

const ymd = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const originalTz = process.env.TZ;
afterEach(() => {
  // 直接指定 undefined 會變成字串 "undefined"，要 delete 才是還原
  if (originalTz === undefined) delete process.env.TZ;
  else process.env.TZ = originalTz;
});

// daodao#295：結束日 = 開始日 + 天數 − 1（與 server practices.end_date 相同）
describe("practiceEndDate", () => {
  it("14 天挑戰 2026-10-09 起結束於 2026-10-22", () => {
    expect(ymd(practiceEndDate(new Date(2026, 9, 9), 14))).toBe("2026-10-22");
  });

  it("1 天的實踐開始日即結束日", () => {
    expect(ymd(practiceEndDate(new Date(2026, 9, 9), 1))).toBe("2026-10-09");
  });

  it("跨月", () => {
    expect(ymd(practiceEndDate(new Date(2026, 9, 25), 14))).toBe("2026-11-07");
  });
});

// daodao#295 review 2：new Date('YYYY-MM-DD') 是 UTC 午夜，負時差時區會變成前一天
describe("parseLocalDate", () => {
  for (const tz of ["America/Los_Angeles", "Asia/Taipei", "UTC"]) {
    it(`${tz}：日期字串解析成當地日曆日，開始日與結束日都不偏移`, () => {
      process.env.TZ = tz;
      const start = parseLocalDate("2026-10-09");
      expect(start).not.toBeNull();
      expect(ymd(start as Date)).toBe("2026-10-09");
      expect(ymd(practiceEndDate(start as Date, 14))).toBe("2026-10-22");
    });
  }

  it("接受帶時間的 ISO 字串，只取日期部分", () => {
    process.env.TZ = "America/Los_Angeles";
    expect(ymd(parseLocalDate("2026-10-09T00:00:00.000Z") as Date)).toBe("2026-10-09");
  });

  it("無效字串回 null", () => {
    expect(parseLocalDate("not-a-date")).toBeNull();
    expect(parseLocalDate("")).toBeNull();
    expect(parseLocalDate("2026-02-30")).toBeNull();
  });
});

// 剩餘天數：今天到結束日（含頭尾）的日曆日數，介於 0 與總天數之間
describe("practiceRemainingDays", () => {
  // 在測試內建立，避免 describe 收集時與執行時的時區不同
  const start = () => new Date(2026, 9, 9);

  it("開始日當天（不論幾點）剩總天數", () => {
    expect(practiceRemainingDays(start(), 14, new Date(2026, 9, 9, 22))).toBe(14);
  });

  it("2026-10-10 剩 13 天（10/10～10/22）", () => {
    expect(practiceRemainingDays(start(), 14, new Date(2026, 9, 10, 10))).toBe(13);
  });

  it("結束日當天剩 1 天", () => {
    expect(practiceRemainingDays(start(), 14, new Date(2026, 9, 22, 23))).toBe(1);
  });

  it("開始前不超過總天數、結束後為 0", () => {
    expect(practiceRemainingDays(start(), 14, new Date(2026, 9, 1, 10))).toBe(14);
    expect(practiceRemainingDays(start(), 14, new Date(2026, 9, 23, 0, 30))).toBe(0);
  });
});
