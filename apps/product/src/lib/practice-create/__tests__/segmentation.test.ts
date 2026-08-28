import { differenceInCalendarDays } from "date-fns";
import { describe, expect, it } from "vitest";
import { calcEndDate } from "../date-range";
import { allocateSegmentDays, defaultSegmentCount, segmentDateRanges } from "../segmentation";

describe("defaultSegmentCount", () => {
  it("is min(3, max(2, ceil(days / 30)))", () => {
    expect(defaultSegmentCount(60)).toBe(2);
    expect(defaultSegmentCount(90)).toBe(3);
    expect(defaultSegmentCount(31)).toBe(2);
    expect(defaultSegmentCount(61)).toBe(3);
    expect(defaultSegmentCount(7)).toBe(2);
  });
});

describe("allocateSegmentDays", () => {
  it("splits evenly and gives the remainder to earlier segments", () => {
    expect(allocateSegmentDays(40, 3)).toEqual([14, 13, 13]);
    expect(allocateSegmentDays(90, 3)).toEqual([30, 30, 30]);
    expect(allocateSegmentDays(31, 2)).toEqual([16, 15]);
  });

  it("always sums to the total", () => {
    for (const total of [31, 40, 45, 89, 90]) {
      for (const count of [2, 3]) {
        const days = allocateSegmentDays(total, count);
        expect(days).toHaveLength(count);
        expect(days.reduce((sum, d) => sum + d, 0)).toBe(total);
      }
    }
  });

  it("returns an empty array for a non-positive segment count", () => {
    expect(allocateSegmentDays(40, 0)).toEqual([]);
  });
});

describe("segmentDateRanges", () => {
  const start = new Date(2026, 8, 1);
  const days = [14, 13, 13];
  const ranges = segmentDateRanges(start, days);

  it("starts at the given start date", () => {
    expect(ranges[0]?.start).toEqual(start);
  });

  it("ends where a single 40-day practice would end", () => {
    expect(ranges.at(-1)?.end).toEqual(calcEndDate(start, 40));
  });

  it("produces contiguous, non-overlapping ranges", () => {
    for (let i = 1; i < ranges.length; i += 1) {
      const previous = ranges[i - 1];
      const current = ranges[i];
      if (!previous || !current) throw new Error(`missing range at ${i}`);
      expect(differenceInCalendarDays(current.start, previous.end)).toBe(1);
    }
  });

  it("gives each range the requested number of days (inclusive)", () => {
    ranges.forEach((range, i) => {
      expect(differenceInCalendarDays(range.end, range.start) + 1).toBe(days[i]);
    });
  });

  it("returns an empty array for no segments", () => {
    expect(segmentDateRanges(start, [])).toEqual([]);
  });
});
