import { afterEach, describe, expect, it, vi } from "vitest";
import { calculateRemainingDays, formatCardDate } from "../practice-card";

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
