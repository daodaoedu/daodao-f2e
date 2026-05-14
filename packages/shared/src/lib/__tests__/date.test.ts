import { afterEach, describe, expect, it, vi } from "vitest";
import { calculateTimeDifference } from "../date";

describe("calculateTimeDifference", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns days when difference is >= 1 day", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-10T12:00:00Z"));

    const result = calculateTimeDifference("2024-06-07T12:00:00Z");
    expect(result).toEqual({ value: 3, unit: "days" });
  });

  it("returns hours when difference is < 24 hours but > 0", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-10T12:00:00Z"));

    const result = calculateTimeDifference("2024-06-10T06:00:00Z");
    expect(result).toEqual({ value: 6, unit: "hours" });
  });

  it("returns minutes when difference is < 60 minutes but > 0", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-10T12:00:00Z"));

    const result = calculateTimeDifference("2024-06-10T11:30:00Z");
    expect(result).toEqual({ value: 30, unit: "minutes" });
  });

  it("returns just_now when difference is 0", () => {
    vi.useFakeTimers();
    const now = new Date("2024-06-10T12:00:00Z");
    vi.setSystemTime(now);

    const result = calculateTimeDifference(now);
    expect(result).toEqual({ value: 0, unit: "just_now" });
  });

  it("returns just_now for a future date", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-10T12:00:00Z"));

    const result = calculateTimeDifference("2024-06-11T12:00:00Z");
    expect(result).toEqual({ value: 0, unit: "just_now" });
  });

  it("accepts a Date object", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-10T12:00:00Z"));

    const result = calculateTimeDifference(new Date("2024-06-08T12:00:00Z"));
    expect(result).toEqual({ value: 2, unit: "days" });
  });
});
