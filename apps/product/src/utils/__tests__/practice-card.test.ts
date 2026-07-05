import { afterEach, describe, expect, it, vi } from "vitest";
import { calculateDaysProgress, calculateRemainingDays, formatCardDate } from "../practice-card";

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
    vi.setSystemTime(new Date("2026-05-18T00:00:00Z"));
    expect(calculateRemainingDays("2026-05-25")).toBe(7);
  });

  it("returns 0 when endDate is today", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-18T00:00:00Z"));
    expect(calculateRemainingDays("2026-05-18")).toBe(0);
  });

  it("returns negative days when endDate is in the past", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-18T00:00:00Z"));
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
    // lines up with parseISO's local-timezone parsing of date-only strings,
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

  it("formats ISO date to MM/DD", () => {
    expect(formatCardDate("2026-01-15")).toBe("01/15");
  });

  it("formats single-digit month and day with leading zeros", () => {
    expect(formatCardDate("2026-03-07")).toBe("03/07");
  });
});
