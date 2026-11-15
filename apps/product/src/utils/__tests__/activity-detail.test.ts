import { describe, expect, it } from "vitest";
import {
  formatActivityPeriod,
  formatCalendarDate,
  resolveLocationDisplay,
  resolvePracticeDisplay,
  weekdayIndexOf,
} from "../activity-detail";

describe("resolveLocationDisplay", () => {
  it.each([
    null,
    undefined,
    "",
    "   ",
  ])("no location (%j) is N/A for joined and guests alike", (loc) => {
    expect(resolveLocationDisplay(loc, true)).toEqual({ kind: "na" });
    expect(resolveLocationDisplay(loc, false)).toEqual({ kind: "na" });
  });

  it("hides a configured location from non-members", () => {
    expect(resolveLocationDisplay("台北市信義區", false)).toEqual({ kind: "locked" });
  });

  it("shows a configured location to members", () => {
    expect(resolveLocationDisplay("台北市信義區", true)).toEqual({
      kind: "visible",
      value: "台北市信義區",
    });
  });
});

describe("resolvePracticeDisplay", () => {
  it.each([0, null, undefined, -1])("no assigned practice (%j) is N/A", (n) => {
    expect(resolvePracticeDisplay(n)).toEqual({ kind: "na" });
  });

  it("reports the number of practices", () => {
    expect(resolvePracticeDisplay(1)).toEqual({ kind: "count", count: 1 });
    expect(resolvePracticeDisplay(3)).toEqual({ kind: "count", count: 3 });
  });
});

describe("activity period / date format", () => {
  it("formats cohort start and end as yyyy/MM/dd from ISO timestamps", () => {
    expect(formatActivityPeriod("2026-11-14T00:00:00.000Z", "2026-11-28T00:00:00.000Z")).toBe(
      "2026/11/14 – 2026/11/28"
    );
  });

  it("keeps the calendar day of a date-only string", () => {
    expect(formatCalendarDate("2026-11-14")).toBe("2026/11/14");
  });

  it("falls back to the raw value when it is not a date", () => {
    expect(formatCalendarDate("soon")).toBe("soon");
  });
});

describe("weekdayIndexOf", () => {
  it("returns Sunday=0 for 2026/11/15 and Saturday=6 for 2026/11/14", () => {
    expect(weekdayIndexOf("2026/11/15")).toBe(0);
    expect(weekdayIndexOf("2026/11/14")).toBe(6);
    expect(weekdayIndexOf("2026/11/16")).toBe(1);
  });

  it("returns null for unparsable input", () => {
    expect(weekdayIndexOf("n/a")).toBeNull();
  });
});
