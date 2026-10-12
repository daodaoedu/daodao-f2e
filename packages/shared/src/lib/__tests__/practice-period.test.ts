import { afterEach, describe, expect, it } from "vitest";
import {
  minEditableStartDate,
  parseLocalDate,
  practiceEndDate,
  practiceEndDateString,
  practiceRemainingDays,
} from "../practice-period";

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

  // daodao#295 review 3：日期後面接其他字元的格式錯誤字串要拒絕，不可只取前 10 碼
  it("日期後面接非時間字元的字串回 null", () => {
    expect(parseLocalDate("2026-10-09abc")).toBeNull();
    expect(parseLocalDate("2026-10-099")).toBeNull();
    expect(parseLocalDate("2026-10-09 garbage")).toBeNull();
  });
});

// daodao#277：範本庫、梯次指派與學員實踐顯示的結束日要同一天（含開始日當天：開始日 + 天數 − 1）
describe("practiceEndDateString", () => {
  for (const tz of ["America/Los_Angeles", "Asia/Taipei", "UTC"]) {
    it(`${tz}：7 天範本 2026-10-20 起結束於 2026-10-26`, () => {
      process.env.TZ = tz;
      expect(practiceEndDateString("2026-10-20", 7)).toBe("2026-10-26");
    });
  }

  it("接受帶時間的 ISO 字串（API 綁定日期），只取日期部分", () => {
    expect(practiceEndDateString("2026-10-20T00:00:00.000Z", 7)).toBe("2026-10-26");
  });

  it("跨月、跨年", () => {
    expect(practiceEndDateString("2026-02-03", 30)).toBe("2026-03-04");
    expect(practiceEndDateString("2026-12-30", 7)).toBe("2027-01-05");
  });

  it("沒有開始日、天數不是正整數或日期無效時回 null", () => {
    expect(practiceEndDateString(null, 7)).toBeNull();
    expect(practiceEndDateString("2026-10-20", null)).toBeNull();
    expect(practiceEndDateString("2026-10-20", 0)).toBeNull();
    expect(practiceEndDateString("2026-02-30", 7)).toBeNull();
  });
});

// daodao#277：學員編輯頁的開始日下限不可因 new Date('YYYY-MM-DD')（UTC 午夜）在負時差時區變成前一天
describe("minEditableStartDate", () => {
  for (const tz of ["America/Los_Angeles", "Asia/Taipei", "UTC"]) {
    it(`${tz}：已排程的過去開始日保留原日期`, () => {
      process.env.TZ = tz;
      const min = minEditableStartDate("2026-10-20", new Date(2026, 9, 25, 9));
      expect(ymd(min)).toBe("2026-10-20");
      expect(min.getHours()).toBe(0);
    });

    it(`${tz}：開始日在未來時下限是今天`, () => {
      process.env.TZ = tz;
      expect(ymd(minEditableStartDate("2026-10-30", new Date(2026, 9, 25, 9)))).toBe("2026-10-25");
    });
  }

  it("沒有開始日或格式錯誤時下限是今天", () => {
    expect(ymd(minEditableStartDate(null, new Date(2026, 9, 25, 9)))).toBe("2026-10-25");
    expect(ymd(minEditableStartDate("bad", new Date(2026, 9, 25, 9)))).toBe("2026-10-25");
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
