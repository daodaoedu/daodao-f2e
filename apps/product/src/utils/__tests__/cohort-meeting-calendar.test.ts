import { describe, expect, it } from "vitest";
import { groupMeetingSessions, isCohortQuickAccessVisible } from "../cohort-meeting-calendar";

const meeting = (id: number, startTime: string, endTime: string) => ({
  id,
  sessionDate: "2026-11-12",
  startTime,
  endTime,
});

describe("member calendar groups", () => {
  it("orders meetings on the same date and keeps past and ongoing meetings", () => {
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

  it("moves meetings to ongoing at the start and past at the end", () => {
    const sessions = [meeting(1, "19:00", "21:00")];
    expect(
      groupMeetingSessions(sessions, "Asia/Tokyo", new Date("2026-11-12T10:00:00Z"))
        .inProgressSessions
    ).toEqual(sessions);
    const ended = groupMeetingSessions(sessions, "Asia/Tokyo", new Date("2026-11-12T12:00:00Z"));
    expect(ended.pastSessions).toEqual(sessions);
    expect(ended.nextSession).toBeUndefined();
  });

  it("classifies across dates and uses the meeting's DST offset", () => {
    const sessions = [{ ...meeting(1, "19:00", "21:00"), sessionDate: "2026-07-10" }];
    expect(
      groupMeetingSessions(sessions, "America/Los_Angeles", new Date("2026-07-11T03:00:00Z"))
        .inProgressSessions
    ).toEqual(sessions);
  });

  it("keeps ended meetings newest first and accepts an empty schedule", () => {
    const sessions = [meeting(1, "10:00", "11:00"), meeting(2, "13:00", "14:00")];
    expect(
      groupMeetingSessions(
        sessions,
        "Asia/Taipei",
        new Date("2026-12-01T00:00:00Z")
      ).pastSessions.map(({ id }) => id)
    ).toEqual([2, 1]);
    expect(groupMeetingSessions([], "Asia/Taipei", new Date()).nextSession).toBeUndefined();
  });
});

describe("homepage cohort quick access", () => {
  const now = new Date(2026, 10, 12, 12);
  it("includes published cohorts from their start day, excluding future and archived cohorts", () => {
    expect(
      isCohortQuickAccessVisible({ status: "published", startDate: "2026-11-12T00:00:00Z" }, now)
    ).toBe(true);
    expect(
      isCohortQuickAccessVisible({ status: "published", startDate: "2026-11-13T00:00:00Z" }, now)
    ).toBe(false);
    expect(
      isCohortQuickAccessVisible({ status: "archived", startDate: "2026-11-01T00:00:00Z" }, now)
    ).toBe(false);
    expect(
      isCohortQuickAccessVisible({ status: "published", startDate: "2026-10-01T00:00:00Z" }, now)
    ).toBe(true);
  });
});
