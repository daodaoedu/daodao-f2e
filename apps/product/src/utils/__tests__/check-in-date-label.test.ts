import { describe, expect, it } from "vitest";
import { getCheckInDateLabel } from "../check-in-date-label";

describe("check-in calendar date label", () => {
  it("keeps December 1 on the same calendar day as the date navigation", () => {
    expect(getCheckInDateLabel("2026-12-01")).toEqual({ year: "2026", monthDay: "12/01" });
  });

  it("keeps November 30 and dotted display dates on their saved day", () => {
    expect(getCheckInDateLabel("2026.11.30")).toEqual({ year: "2026", monthDay: "11/30" });
  });

  it("preserves the year when the saved day is New Year's Day", () => {
    expect(getCheckInDateLabel("2027-01-01")).toEqual({ year: "2027", monthDay: "01/01" });
  });

  it("keeps the existing readable fallback for malformed date text", () => {
    expect(getCheckInDateLabel("unknown")).toEqual({ year: "unknown", monthDay: "" });
  });
});
