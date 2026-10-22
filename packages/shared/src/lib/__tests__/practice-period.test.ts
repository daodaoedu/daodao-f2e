import { afterEach, describe, expect, it } from "vitest";
import {
  isPracticeEnded,
  minEditableStartDate,
  parseLocalDate,
  practiceEndDate,
  practiceEndDateString,
  practiceRemainingDays,
  practiceTimeProgress,
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

// daodao#277：結束日當天整天都還沒到期；以 new Date('YYYY-MM-DD') 解析會在負時差時區提早一天到期
describe("isPracticeEnded", () => {
  for (const tz of ["America/Los_Angeles", "Asia/Taipei", "UTC"]) {
    it(`${tz}：結束日當天 23:00 未到期，隔天 00:30 到期`, () => {
      process.env.TZ = tz;
      expect(isPracticeEnded("2026-10-26", new Date(2026, 9, 26, 23))).toBe(false);
      expect(isPracticeEnded("2026-10-26", new Date(2026, 9, 27, 0, 30))).toBe(true);
      // API 的 endDate 可能帶時間（UTC 午夜），只取日期部分
      expect(isPracticeEnded("2026-10-26T00:00:00.000Z", new Date(2026, 9, 26, 23))).toBe(false);
    });
  }

  it("沒有結束日或格式錯誤時不算到期", () => {
    expect(isPracticeEnded(null, new Date(2026, 9, 27))).toBe(false);
    expect(isPracticeEnded("bad", new Date(2026, 9, 27))).toBe(false);
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

// daodao#335：App 公開實踐頁進度環原本以 new Date("YYYY-MM-DD")（UTC 午夜）解析、期間只到結束日 00:00，
// 台灣時間結束日 08:00 後就 100%、1 天的實踐一律 0%
describe("practiceTimeProgress", () => {
  // 10/20～10/26 共 7 天；期間為 10/20 當地 00:00 到 10/27 當地 00:00
  const range = { startDate: "2026-10-20", endDate: "2026-10-26" };
  const progressAt = (iso: string) =>
    practiceTimeProgress(range.startDate, range.endDate, new Date(iso));

  it("Asia/Taipei：開始日 00:00～08:00（UTC 仍是前一天）已開始計算進度", () => {
    process.env.TZ = "Asia/Taipei";
    // 台北 10/20 00:00 = UTC 10/19 16:00
    expect(progressAt("2026-10-19T16:00:00Z")).toBe(0);
    // 台北 10/20 07:00 = UTC 10/19 23:00：已經過 7 小時
    expect(progressAt("2026-10-19T23:00:00Z")).toBe(Math.floor((7 / 168) * 100));
  });

  it("Asia/Taipei：結束日 08:00 之後仍未滿 100%", () => {
    process.env.TZ = "Asia/Taipei";
    // 台北 10/26 08:30 = UTC 10/26 00:30（舊算法在這之後就是 100%）
    expect(progressAt("2026-10-26T00:30:00Z")).toBeLessThan(100);
    // 台北 10/26 07:00 = UTC 10/25 23:00：6 天 7 小時 / 7 天
    expect(progressAt("2026-10-25T23:00:00Z")).toBe(Math.floor(((6 * 24 + 7) / 168) * 100));
  });

  it("Asia/Taipei：結束日最後一分鐘仍未滿 100%，隔天 00:00 起才 100%", () => {
    process.env.TZ = "Asia/Taipei";
    // 台北 10/26 23:59 = UTC 10/26 15:59
    expect(progressAt("2026-10-26T15:59:00Z")).toBe(99);
    // 台北 10/27 00:00 = UTC 10/26 16:00
    expect(progressAt("2026-10-26T16:00:00Z")).toBe(100);
    expect(progressAt("2026-11-01T04:00:00Z")).toBe(100);
  });

  it("Asia/Taipei：開始前為 0", () => {
    process.env.TZ = "Asia/Taipei";
    expect(progressAt("2026-10-19T15:59:00Z")).toBe(0);
  });

  it("1 天的實踐（起訖同日）當天依時間遞增，不會一律 0%", () => {
    process.env.TZ = "Asia/Taipei";
    // 台北 10/20 12:00 = UTC 10/20 04:00
    expect(practiceTimeProgress("2026-10-20", "2026-10-20", new Date("2026-10-20T04:00:00Z"))).toBe(
      50
    );
    // 台北 10/21 00:00 = UTC 10/20 16:00
    expect(practiceTimeProgress("2026-10-20", "2026-10-20", new Date("2026-10-20T16:00:00Z"))).toBe(
      100
    );
  });

  for (const tz of ["UTC", "Asia/Taipei", "America/Los_Angeles"]) {
    it(`${tz}：同一個當地時刻得到同樣的進度（以當地日曆日計算）`, () => {
      process.env.TZ = tz;
      // 當地 10/26 12:00（結束日中午）：6.5 天 / 7 天
      expect(practiceTimeProgress(range.startDate, range.endDate, new Date(2026, 9, 26, 12))).toBe(
        Math.floor((6.5 / 7) * 100)
      );
      // 當地 10/20 03:00（開始日清晨）
      expect(practiceTimeProgress(range.startDate, range.endDate, new Date(2026, 9, 20, 3))).toBe(
        Math.floor((3 / 168) * 100)
      );
    });
  }

  it("API 回傳帶時間的 ISO 字串時只取日期部分", () => {
    process.env.TZ = "Asia/Taipei";
    expect(
      practiceTimeProgress(
        "2026-10-20T00:00:00.000Z",
        "2026-10-26T00:00:00.000Z",
        new Date(2026, 9, 26, 12)
      )
    ).toBe(Math.floor((6.5 / 7) * 100));
  });

  it("缺日期、格式錯誤或結束早於開始時為 0", () => {
    const now = new Date(2026, 9, 22);
    expect(practiceTimeProgress(null, "2026-10-26", now)).toBe(0);
    expect(practiceTimeProgress("2026-10-20", undefined, now)).toBe(0);
    expect(practiceTimeProgress("bad", "2026-10-26", now)).toBe(0);
    expect(practiceTimeProgress("2026-10-26", "2026-10-20", now)).toBe(0);
  });
});
