import { TZDate } from "@date-fns/tz";
import { DEFAULT_COHORT_TIMEZONE } from "./timezones";

export interface ICohortSessionTime {
  sessionDate: string;
  startTime: string | null;
  endTime: string | null;
}

function validTimezone(value: string | null | undefined): value is string {
  if (!value) return false;
  try {
    new Intl.DateTimeFormat("en", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

export function resolveParticipantTimezone(
  cohortTimezone: string | null | undefined,
  participantTimezone: string | null | undefined
): string {
  if (validTimezone(participantTimezone)) return participantTimezone;
  return validTimezone(cohortTimezone) ? cohortTimezone : DEFAULT_COHORT_TIMEZONE;
}

/** Interpret stored calendar date/clock time in the cohort zone, never in the host zone. */
function convertEndpoint(date: string, time: string, sourceZone: string, targetZone: string) {
  const calendarDate = date.slice(0, 10);
  const clockTime = time.slice(0, 5);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(calendarDate) || !/^\d{2}:\d{2}$/.test(clockTime)) return null;
  const year = Number(calendarDate.slice(0, 4));
  const month = Number(calendarDate.slice(5, 7));
  const day = Number(calendarDate.slice(8, 10));
  const hours = Number(clockTime.slice(0, 2));
  const minutes = Number(clockTime.slice(3, 5));
  if (hours > 23 || minutes > 59 || month < 1 || month > 12 || day < 1 || day > 31) return null;
  try {
    // DST gaps/overlaps follow TZDate's Date-compatible disambiguation.
    const source = new TZDate(year, month - 1, day, hours, minutes, sourceZone);
    if (source.toISOString().slice(0, 10) !== calendarDate) return null;
    const target = source.withTimeZone(targetZone);
    // date-fns v3 format() clones into a host-zone Date. TZDate ISO preserves this zone.
    const wallClock = target.toISOString();
    return { date: wallClock.slice(0, 10).replaceAll("-", "/"), time: wallClock.slice(11, 16) };
  } catch {
    return null;
  }
}

export function formatSessionForTimezone(
  session: ICohortSessionTime,
  cohortTimezone: string | null | undefined,
  participantTimezone: string | null | undefined
) {
  const sourceZone = resolveParticipantTimezone(cohortTimezone, undefined);
  const timezone = resolveParticipantTimezone(sourceZone, participantTimezone);
  if (!session.startTime && !session.endTime) {
    // A calendar-only event has no instant to convert; label its actual source zone.
    return {
      date: session.sessionDate.slice(0, 10).replaceAll("-", "/"),
      startTime: null,
      endTime: null,
      endDate: null,
      timezone: sourceZone,
    };
  }
  const start = session.startTime
    ? convertEndpoint(session.sessionDate, session.startTime, sourceZone, timezone)
    : null;
  const end = session.endTime
    ? convertEndpoint(session.sessionDate, session.endTime, sourceZone, timezone)
    : null;
  if ((session.startTime && !start) || (session.endTime && !end)) {
    // Invalid legacy values cannot be converted reliably. Keep the original row and zone.
    const date = session.sessionDate.slice(0, 10).replaceAll("-", "/");
    return {
      date,
      startTime: session.startTime || null,
      endTime: session.endTime || null,
      endDate: session.endTime ? date : null,
      timezone: sourceZone,
    };
  }
  return {
    date: start?.date ?? end?.date ?? session.sessionDate.slice(0, 10).replaceAll("-", "/"),
    startTime: start?.time ?? null,
    endTime: end?.time ?? null,
    endDate: end?.date ?? null,
    timezone,
  };
}
