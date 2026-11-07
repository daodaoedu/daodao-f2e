import { describe, expect, it } from "vitest";
import {
  groupMeetingSessions,
  isCohortQuickAccessVisible,
  resolveMeetingTimezone,
} from "../cohort-meeting-calendar";

const meeting = (id: number, startTime: string, endTime: string) => ({
  id,
  sessionDate: "2026-11-12",
  startTime,
  endTime,
});

describe("member calendar groups", () => {
  it("orders future meetings once while retaining ongoing and past meetings", () => {
    const sessions = [
      meeting(4, "21:00", "22:00"),
      meeting(2, "18:00", "19:00"),
      meeting(3, "20:00", "21:00"),
      meeting(1, "16:00", "17:00"),
    ];
    const groups = groupMeetingSessions(sessions, "Asia/Taipei", new Date("2026-11-12T10:30:00Z"));
    expect(groups.pastSessions.map(({ id }) => id)).toEqual([1]);
    expect(groups.inProgressSessions.map(({ id }) => id)).toEqual([2]);
    expect(groups.nextSession?.id).toBe(3);
    expect(groups.otherSessions.map(({ id }) => id)).toEqual([4]);
    expect(sessions.map(({ id }) => id)).toEqual([4, 2, 3, 1]);
  });

  it("moves meetings to ongoing exactly at start and past exactly at end", () => {
    const sessions = [meeting(1, "19:00", "21:00")];
    const starting = groupMeetingSessions(sessions, "Asia/Tokyo", new Date("2026-11-12T10:00:00Z"));
    expect(starting.inProgressSessions).toEqual(sessions);
    expect(starting.nextSession).toBeUndefined();
    const ended = groupMeetingSessions(sessions, "Asia/Tokyo", new Date("2026-11-12T12:00:00Z"));
    expect(ended.pastSessions).toEqual(sessions);
    expect(ended.inProgressSessions).toEqual([]);
    expect(ended.nextSession).toBeUndefined();
  });

  it.each([
    ["2026-07-10", "2026-07-11T03:00:00Z"],
    ["2026-11-12", "2026-11-13T04:00:00Z"],
  ])("uses the meeting date's DST offset across UTC dates: %s", (sessionDate, now) => {
    const sessions = [{ ...meeting(1, "19:00", "21:00"), sessionDate }];
    expect(
      groupMeetingSessions(sessions, "America/Los_Angeles", new Date(now)).inProgressSessions
    ).toEqual(sessions);
  });

  it("sorts ended meetings by end time even when start time order differs", () => {
    const sessions = [meeting(1, "09:00", "17:00"), meeting(2, "13:00", "14:00")];
    const groups = groupMeetingSessions(sessions, "Asia/Taipei", new Date("2026-11-12T10:00:00Z"));
    expect(groups.pastSessions.map(({ id }) => id)).toEqual([1, 2]);
    expect(groups.nextSession).toBeUndefined();
    expect(groups.otherSessions).toEqual([]);
  });

  it("orders across dates, preserves history, and supports an empty schedule", () => {
    const sessions = [
      { ...meeting(3, "10:00", "11:00"), sessionDate: "2026-11-14" },
      { ...meeting(1, "10:00", "11:00"), sessionDate: "2026-11-10" },
      { ...meeting(2, "10:00", "11:00"), sessionDate: "2026-11-13" },
    ];
    const groups = groupMeetingSessions(sessions, "Asia/Taipei", new Date("2026-11-12T10:00:00Z"));
    expect(groups.pastSessions.map(({ id }) => id)).toEqual([1]);
    expect(groups.nextSession?.id).toBe(2);
    expect(groups.otherSessions.map(({ id }) => id)).toEqual([3]);
    expect(groupMeetingSessions([], "Asia/Taipei", new Date("2026-11-12T10:00:00Z"))).toEqual({
      pastSessions: [],
      inProgressSessions: [],
      nextSession: undefined,
      otherSessions: [],
    });
  });
});

describe("homepage cohort quick access", () => {
  it("uses the cohort's calendar day when Taipei has started but Los Angeles has not", () => {
    const now = new Date("2026-11-11T16:00:00Z");
    const cohort = {
      status: "published",
      startDate: "2026-11-12T00:00:00Z",
      timezone: "Asia/Taipei",
    };
    expect(isCohortQuickAccessVisible(cohort, now)).toBe(true);
    expect(isCohortQuickAccessVisible({ ...cohort, timezone: "America/Los_Angeles" }, now)).toBe(
      false
    );
  });

  it("opens at Los Angeles midnight rather than the host calendar day", () => {
    const cohort = {
      status: "published",
      startDate: "2026-11-12T00:00:00Z",
      timezone: "America/Los_Angeles",
    };
    expect(isCohortQuickAccessVisible(cohort, new Date("2026-11-12T07:59:59Z"))).toBe(false);
    expect(isCohortQuickAccessVisible(cohort, new Date("2026-11-12T08:00:00Z"))).toBe(true);
  });

  it("retains joined cohorts after the end date regardless of lifecycle status", () => {
    const cohort = {
      status: "archived",
      startDate: "2026-10-01T00:00:00Z",
      endDate: "2026-10-31T00:00:00Z",
      timezone: "Asia/Taipei",
    };
    expect(isCohortQuickAccessVisible(cohort, new Date("2026-11-12T00:00:00Z"))).toBe(true);
  });

  it("uses the start date as a calendar label, not UTC midnight in the cohort zone", () => {
    const cohort = { startDate: "2026-11-12T00:00:00Z", timezone: "Pacific/Honolulu" };
    expect(isCohortQuickAccessVisible(cohort, new Date("2026-11-12T09:59:59Z"))).toBe(false);
    expect(isCohortQuickAccessVisible(cohort, new Date("2026-11-12T10:00:00Z"))).toBe(true);
  });
});

describe("meeting timezone preference", () => {
  it("prefers a valid existing account zone over the device", () => {
    expect(resolveMeetingTimezone("Asia/Taipei", "Asia/Tokyo", "America/Los_Angeles")).toEqual({
      timezone: "Asia/Tokyo",
      source: "participant",
    });
  });

  it.each([undefined, "", "Not/A_Zone"])("uses device when account zone is %s", (account) => {
    expect(resolveMeetingTimezone("Asia/Taipei", account, "America/Los_Angeles")).toEqual({
      timezone: "America/Los_Angeles",
      source: "participant",
    });
  });

  it.each([
    undefined,
    "",
    "Not/A_Zone",
  ])("labels cohort fallback when device zone is %s", (device) => {
    expect(resolveMeetingTimezone("Asia/Tokyo", "Not/A_Zone", device)).toEqual({
      timezone: "Asia/Tokyo",
      source: "cohort",
    });
  });

  it("accepts UTC as a participant timezone and uses the existing legacy cohort default", () => {
    expect(resolveMeetingTimezone("Asia/Taipei", "UTC", "Asia/Tokyo")).toEqual({
      timezone: "UTC",
      source: "participant",
    });
    expect(resolveMeetingTimezone("Not/A_Zone", undefined, undefined)).toEqual({
      timezone: "Asia/Taipei",
      source: "cohort",
    });
  });
});
