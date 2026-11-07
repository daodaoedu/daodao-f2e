import { TZDate } from "@date-fns/tz";
import { compareAsc, compareDesc, parseISO } from "date-fns";
import {
  formatSessionForTimezone,
  type ICohortSessionTime,
  resolveParticipantTimezone,
} from "./cohort-session-timezone";

export type MeetingSessionType = ICohortSessionTime & { id: number };

/** Group the actual instants used by the participant formatter without changing the input. */
export function groupMeetingSessions(sessions: MeetingSessionType[], timezone: string, now: Date) {
  const ordered = sessions
    .map((session) => {
      const utc = formatSessionForTimezone(session, timezone, "UTC");
      // Lighthouse requires complete time ranges. Do not invent midnight for legacy missing times.
      if (!utc.startTime || !utc.endTime) return null;
      const start = parseISO(`${utc.date.replaceAll("/", "-")}T${utc.startTime}:00Z`);
      const endDate = (utc.endDate ?? utc.date).replaceAll("/", "-");
      const end = parseISO(`${endDate}T${utc.endTime}:00Z`);
      return { session, start, end };
    })
    .filter((entry) => entry !== null)
    .sort((a, b) => compareAsc(a.start, b.start) || a.session.id - b.session.id);
  const pastSessions = ordered
    .filter(({ end }) => compareAsc(end, now) <= 0)
    .sort((a, b) => compareDesc(a.end, b.end) || a.session.id - b.session.id)
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

/** Membership comes from useMyCohorts; lifecycle and end date do not remove a joined cohort. */
export function isCohortQuickAccessVisible(
  cohort: { startDate: string; timezone: string },
  now = new Date()
): boolean {
  const timezone = resolveParticipantTimezone(cohort.timezone, undefined);
  // TZDate's ISO retains the cohort zone; date-fns v3 format would clone into the host zone.
  const cohortToday = new TZDate(now, timezone).toISOString().slice(0, 10);
  return cohort.startDate.slice(0, 10) <= cohortToday;
}

/** Keep the hint's source aligned with the valid account/device zone actually selected. */
export function resolveMeetingTimezone(
  cohortTimezone: string | null | undefined,
  accountTimezone?: string | null,
  deviceTimezone?: string | null
): { timezone: string; source: "participant" | "cohort" } {
  for (const timezone of [accountTimezone, deviceTimezone]) {
    if (timezone && resolveParticipantTimezone(undefined, timezone) === timezone) {
      return { timezone, source: "participant" };
    }
  }
  return { timezone: resolveParticipantTimezone(cohortTimezone, undefined), source: "cohort" };
}
