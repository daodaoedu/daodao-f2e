import { afterEach, describe, expect, it, vi } from "vitest";
import {
  calculateDaysProgress,
  calculateRemainingDays,
  formatCardDate,
  isPracticeVisibleByDate,
} from "../practice-card";

describe("calculateRemainingDays", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns null for null endDate", () => {
    expect(calculateRemainingDays(null)).toBeNull();
  });

  it("returns null for undefined endDate", () => {
    expect(calculateRemainingDays(undefined)).toBeNull();
  });

  it("returns positive days when endDate is in the future", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 18));
    expect(calculateRemainingDays("2026-05-25")).toBe(7);
  });

  it("returns 0 when endDate is today", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 18));
    expect(calculateRemainingDays("2026-05-18")).toBe(0);
  });

  it("returns negative days when endDate is in the past", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 18));
    expect(calculateRemainingDays("2026-05-10")).toBe(-8);
  });
});

describe("calculateDaysProgress", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns null for null startDate", () => {
    expect(calculateDaysProgress(null, "2026-05-25")).toBeNull();
  });

  it("returns null for null endDate", () => {
    expect(calculateDaysProgress("2026-05-18", null)).toBeNull();
  });

  it("returns null when endDate is before startDate", () => {
    expect(calculateDaysProgress("2026-05-20", "2026-05-19")).toBeNull();
  });

  it("counts total days inclusively of both start and end date", () => {
    vi.useFakeTimers();
    // Local Date constructor (not a UTC ISO string) so the mocked "now"
    // lines up with local calendar parsing of date-only strings,
    // regardless of the machine's timezone offset.
    vi.setSystemTime(new Date(2026, 4, 1));
    // startDate + (durationDays - 1) = endDate, so a 30-day practice starting
    // 05/01 ends 05/30 — total must report 30, matching backend durationDays.
    expect(calculateDaysProgress("2026-05-01", "2026-05-30")).toEqual({
      elapsed: 1,
      total: 30,
    });
  });

  it("returns total of 1 for a single-day practice", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 1));
    expect(calculateDaysProgress("2026-05-01", "2026-05-01")).toEqual({
      elapsed: 1,
      total: 1,
    });
  });

  it("counts today as an elapsed day (day 1 on the start date)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 3));
    expect(calculateDaysProgress("2026-05-01", "2026-05-30")).toEqual({
      elapsed: 3,
      total: 30,
    });
  });

  it("caps elapsed at total once the practice period has passed", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 23));
    expect(calculateDaysProgress("2026-06-10", "2026-06-22")).toEqual({
      elapsed: 13,
      total: 13,
    });
  });
});

describe("formatCardDate", () => {
  it("returns null for null date", () => {
    expect(formatCardDate(null)).toBeNull();
  });

  it("returns null for undefined date", () => {
    expect(formatCardDate(undefined)).toBeNull();
  });

  it("formats ISO date to yyyy/MM/dd", () => {
    expect(formatCardDate("2026-01-15")).toBe("2026/01/15");
  });

  it("formats single-digit month and day with leading zeros", () => {
    expect(formatCardDate("2026-03-07")).toBe("2026/03/07");
  });
});

describe("API calendar dates", () => {
  afterEach(() => vi.useRealTimers());

  it("keeps the backend calendar date when formatted from a midnight ISO value", () => {
    expect(formatCardDate("2026-11-02T00:00:00.000Z")).toBe("2026/11/02");
  });

  it("starts at day one for midnight ISO values on the local start date", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 2, 12));
    expect(calculateDaysProgress("2026-11-02T00:00:00.000Z", "2026-11-08T00:00:00.000Z")).toEqual({
      elapsed: 1,
      total: 7,
    });
  });
});

describe("isPracticeVisibleByDate", () => {
  it.each([
    ["before start", "2026-11-09", "2026-11-12", false],
    ["on start", "2026-11-08", "2026-11-12", true],
    ["between dates", "2026-11-01", "2026-11-12", true],
    ["on end", "2026-11-01", "2026-11-08", true],
    ["after end", "2026-11-01", "2026-11-07", false],
    ["single day", "2026-11-08", "2026-11-08", true],
    ["reversed range", "2026-11-09", "2026-11-07", false],
  ])("%s", (_label, start, end, expected) => {
    expect(isPracticeVisibleByDate(start, end, new Date(2026, 10, 8, 23, 59))).toBe(expected);
  });

  it("includes the start date from local midnight", () => {
    expect(isPracticeVisibleByDate("2026-11-08", "2026-11-10", new Date(2026, 10, 8))).toBe(true);
  });

  it("uses the calendar date prefix for API timestamps", () => {
    expect(
      isPracticeVisibleByDate(
        "2026-11-08T00:00:00Z",
        "2026-11-08T00:00:00Z",
        new Date(2026, 10, 8, 23)
      )
    ).toBe(true);
  });
});

describe("legacy practice dates", () => {
  const now = new Date(2026, 10, 8, 12);
  it.each([
    [undefined, undefined, true],
    [null, null, true],
    ["", "", true],
    [undefined, "2026-11-07", false],
    [undefined, "2026-11-08", true],
    ["2026-11-09", undefined, false],
    ["2026-11-08", undefined, true],
    ["bad-date", "2026-11-09", false],
    ["2026-02-30", undefined, false],
    [undefined, "bad-date", false],
  ])("start=%s end=%s visible=%s", (start, end, expected) => {
    expect(isPracticeVisibleByDate(start, end, now)).toBe(expected);
  });
});
