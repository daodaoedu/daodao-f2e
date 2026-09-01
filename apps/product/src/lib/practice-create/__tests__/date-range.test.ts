import { describe, expect, it } from "vitest";
import { calcEndDate, formatDateRange } from "../date-range";

describe("calcEndDate", () => {
  it("counts the first day as day one", () => {
    expect(calcEndDate(new Date(2026, 7, 20), 7)).toEqual(new Date(2026, 7, 26));
  });

  it("crosses a year boundary", () => {
    expect(calcEndDate(new Date(2026, 11, 28), 14)).toEqual(new Date(2027, 0, 10));
  });

  it("returns the start date for a 1-day duration", () => {
    expect(calcEndDate(new Date(2026, 7, 20), 1)).toEqual(new Date(2026, 7, 20));
  });
});

describe("formatDateRange", () => {
  it("omits the year on the end date when both dates share a year", () => {
    expect(formatDateRange(new Date(2026, 7, 20), new Date(2026, 7, 26))).toBe(
      "2026/08/20 – 08/26"
    );
  });

  it("keeps the full year on the end date across years", () => {
    expect(formatDateRange(new Date(2026, 11, 28), new Date(2027, 0, 10))).toBe(
      "2026/12/28 – 2027/01/10"
    );
  });
});
