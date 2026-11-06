import { compareAsc, format, parseISO } from "date-fns";
import { formatSessionForTimezone, type ICohortSessionTime } from "./cohort-session-timezone";

export type MeetingSessionType = ICohortSessionTime & { id: number };

/** Compare the same instants used by the existing participant timezone formatter. */
export function groupMeetingSessions(sessions: MeetingSessionType[], timezone: string, now: Date) {
  const ordered = sessions
    .map((session) => {
      const utc = formatSessionForTimezone(session, timezone, "UTC");
      const start = parseISO(`${utc.date.replaceAll("/", "-")}T${utc.startTime ?? "00:00"}:00Z`);
      const endDate = (utc.endDate ?? utc.date).replaceAll("/", "-");
      const end = parseISO(`${endDate}T${utc.endTime ?? utc.startTime ?? "23:59"}:00Z`);
      return { session, start, end };
    })
    .sort((a, b) => compareAsc(a.start, b.start) || a.session.id - b.session.id);
  const pastSessions = ordered
    .filter(({ end }) => compareAsc(end, now) <= 0)
    .reverse()
    .map(({ session }) => session);
  const inProgressSessions = ordered
    .filter(({ start, end }) => compareAsc(start, now) <= 0 && compareAsc(end, now) > 0)
    .map(({ session }) => session);
  const upcoming = ordered
    .filter(({ start }) => compareAsc(start, now) > 0)
    .map(({ session }) => session);
  return {
    pastSessions,
    inProgressSessions,
    nextSession: upcoming[0],
    otherSessions: upcoming.slice(1),
  };
}

/** Cohort start/end are calendar dates; membership is enforced by useMyCohorts. */
export function isCohortQuickAccessVisible(
  cohort: { status: string; startDate: string },
  now = new Date()
) {
  return (
    cohort.status === "published" && cohort.startDate.slice(0, 10) <= format(now, "yyyy-MM-dd")
  );
}
