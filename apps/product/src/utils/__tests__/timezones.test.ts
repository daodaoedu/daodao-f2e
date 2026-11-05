import { describe, expect, it } from "vitest";
import { DEFAULT_COHORT_TIMEZONE, TIME_ZONE_OPTIONS } from "../timezones";

describe("cohort timezone choices", () => {
  it("provides Taipei by default and searchable valid IANA choices", () => {
    expect(DEFAULT_COHORT_TIMEZONE).toBe("Asia/Taipei");
    expect(TIME_ZONE_OPTIONS).toContain("Asia/Tokyo");
    expect(TIME_ZONE_OPTIONS).toContain("UTC");
    expect(
      TIME_ZONE_OPTIONS.filter((zone) => ["UTC", "Asia/Tokyo", "Asia/Taipei"].includes(zone))
    ).toEqual(["Asia/Taipei", "Asia/Tokyo", "UTC"]);
    expect(TIME_ZONE_OPTIONS.filter((zone) => zone.toLowerCase().includes("asia/tai"))).toContain(
      "Asia/Taipei"
    );
    expect(new Set(TIME_ZONE_OPTIONS).size).toBe(TIME_ZONE_OPTIONS.length);
    expect(
      TIME_ZONE_OPTIONS.every(
        (zone) => new Intl.DateTimeFormat("en", { timeZone: zone }).resolvedOptions().timeZone
      )
    ).toBe(true);
  });
});
