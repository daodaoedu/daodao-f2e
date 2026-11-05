import { describe, expect, it } from "vitest";
import { formatSessionForTimezone, resolveParticipantTimezone } from "../cohort-session-timezone";

const session = { sessionDate: "2026-11-10", startTime: "09:00", endTime: "10:00" };

describe("participant meeting timezone", () => {
  it("shows Taipei morning on the previous date in Los Angeles", () => {
    expect(formatSessionForTimezone(session, "Asia/Taipei", "America/Los_Angeles")).toEqual({
      date: "2026/11/09",
      startTime: "17:00",
      endTime: "18:00",
      endDate: "2026/11/09",
      timezone: "America/Los_Angeles",
    });
  });

  it("uses the offset at the meeting date, including summer daylight saving time", () => {
    expect(
      formatSessionForTimezone(
        { ...session, sessionDate: "2026-07-10" },
        "Asia/Taipei",
        "America/Los_Angeles"
      )
    ).toMatchObject({ date: "2026/07/09", startTime: "18:00", endTime: "19:00" });
  });

  it("reinterprets the same clock time after the cohort timezone changes", () => {
    expect(formatSessionForTimezone(session, "Asia/Tokyo", "America/Los_Angeles")).toMatchObject({
      date: "2026/11/09",
      startTime: "16:00",
      endTime: "17:00",
    });
    expect(session).toEqual({ sessionDate: "2026-11-10", startTime: "09:00", endTime: "10:00" });
  });

  it("retains both dates when the displayed meeting spans midnight", () => {
    expect(
      formatSessionForTimezone(
        { ...session, startTime: "15:00", endTime: "17:00" },
        "Asia/Taipei",
        "America/Los_Angeles"
      )
    ).toEqual({
      date: "2026/11/09",
      startTime: "23:00",
      endTime: "01:00",
      endDate: "2026/11/10",
      timezone: "America/Los_Angeles",
    });
  });

  it.each([
    undefined,
    "",
    "Not/A_Zone",
  ])("falls back to the cohort zone when viewer zone is %s", (viewer) => {
    expect(formatSessionForTimezone(session, "Asia/Tokyo", viewer)).toMatchObject({
      date: "2026/11/10",
      startTime: "09:00",
      endTime: "10:00",
      timezone: "Asia/Tokyo",
    });
  });

  it("accepts UTC and safely defaults a missing legacy cohort zone", () => {
    expect(resolveParticipantTimezone(undefined, undefined)).toBe("Asia/Taipei");
    expect(formatSessionForTimezone(session, undefined, "UTC")).toMatchObject({
      date: "2026/11/10",
      startTime: "01:00",
      endTime: "02:00",
      timezone: "UTC",
    });
  });

  it("defaults an invalid legacy cohort timezone before conversion", () => {
    expect(formatSessionForTimezone(session, "Not/A_Zone", "UTC")).toMatchObject({
      date: "2026/11/10",
      startTime: "01:00",
      endTime: "02:00",
      timezone: "UTC",
    });
  });

  it("retains a date-only session in its source zone rather than inventing midnight", () => {
    expect(
      formatSessionForTimezone(
        { ...session, startTime: null, endTime: null },
        "Asia/Taipei",
        "America/Los_Angeles"
      )
    ).toEqual({
      date: "2026/11/10",
      startTime: null,
      endTime: null,
      endDate: null,
      timezone: "Asia/Taipei",
    });
  });

  it("converts each available endpoint without inventing missing times", () => {
    expect(
      formatSessionForTimezone({ ...session, endTime: null }, "Asia/Taipei", "America/Los_Angeles")
    ).toMatchObject({ date: "2026/11/09", startTime: "17:00", endTime: null, endDate: null });
    expect(
      formatSessionForTimezone(
        { ...session, startTime: null },
        "Asia/Taipei",
        "America/Los_Angeles"
      )
    ).toMatchObject({
      date: "2026/11/09",
      startTime: null,
      endTime: "18:00",
      endDate: "2026/11/09",
    });
  });

  it("converts a valid meeting around the source-zone DST transition", () => {
    expect(
      formatSessionForTimezone(
        { sessionDate: "2026-03-08", startTime: "01:30", endTime: "03:30" },
        "America/Los_Angeles",
        "UTC"
      )
    ).toMatchObject({ date: "2026/03/08", startTime: "09:30", endTime: "10:30", timezone: "UTC" });
  });
});

describe("malformed legacy session display", () => {
  it.each([
    { sessionDate: "not-a-date", startTime: "09:00", endTime: "10:00" },
    { sessionDate: "2026-02-30", startTime: "09:00", endTime: "10:00" },
    { sessionDate: "2026-11-10", startTime: "25:90", endTime: "10:00" },
    { sessionDate: "2026-11-10", startTime: "9:0", endTime: null },
  ])("shows invalid legacy data in its source zone without crashing: %j", (legacy) => {
    expect(formatSessionForTimezone(legacy, "Asia/Tokyo", "America/Los_Angeles")).toEqual({
      date: legacy.sessionDate.slice(0, 10).replaceAll("-", "/"),
      startTime: legacy.startTime,
      endTime: legacy.endTime,
      endDate: legacy.endTime ? legacy.sessionDate.slice(0, 10).replaceAll("-", "/") : null,
      timezone: "Asia/Tokyo",
    });
  });
});
