import { describe, expect, it } from "vitest";
import {
  getResourceDate,
  getResourceDayNumber,
  isResourceDayInRange,
} from "../resource-usage-date";

describe("resource usage calendar dates", () => {
  it("counts the start date as day one across month, leap year and year boundaries", () => {
    expect(getResourceDate("2028-02-28", 3)).toBe("2028-03-01");
    expect(getResourceDate("2026-12-31", 2)).toBe("2027-01-01");
    expect(getResourceDate("2026-11-04T00:00:00.000Z", 1)).toBe("2026-11-04");
    expect(getResourceDayNumber("2028-02-28", "2028-03-01")).toBe(3);
  });
  it("counts calendar days rather than elapsed hours over daylight saving boundaries", () => {
    expect(getResourceDayNumber("2026-03-07", "2026-03-09")).toBe(3);
    expect(getResourceDayNumber("2026-10-31", "2026-11-02")).toBe(3);
  });
  it("keeps whole-period resources unassigned and rejects invalid dates and days", () => {
    expect(getResourceDate("2026-11-04", null)).toBeNull();
    expect(getResourceDate("2026-02-30", 1)).toBeNull();
    expect(getResourceDate("invalid", 1)).toBeNull();
    expect(getResourceDate("2026-11-04", 0)).toBeNull();
    expect(getResourceDate("2026-11-04", 1.5)).toBeNull();
    expect(getResourceDayNumber("2026-11-04", "2026-02-30")).toBeNull();
  });
  it("includes both boundaries and retains an out-of-range assignment until explicitly changed", () => {
    expect(isResourceDayInRange(null, 7)).toBe(true);
    expect(isResourceDayInRange(undefined, 7)).toBe(true);
    expect(isResourceDayInRange(1, 7)).toBe(true);
    expect(isResourceDayInRange(7, 7)).toBe(true);
    expect(isResourceDayInRange(8, 7)).toBe(false);
    expect(isResourceDayInRange(0, 7)).toBe(false);
    expect(isResourceDayInRange(1.5, 7)).toBe(false);
    expect(getResourceDate("2026-11-04", 8)).toBe("2026-11-11");
    expect(getResourceDayNumber("2026-11-04", "2026-11-03")).toBe(0);
  });
  it("moves the displayed date with the practice start without changing the stored day", () => {
    expect(getResourceDate("2026-11-04", 2)).toBe("2026-11-05");
    expect(getResourceDate("2026-11-06", 2)).toBe("2026-11-07");
  });
});
