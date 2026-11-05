import { addDays, differenceInCalendarDays, format, getDay, parseISO } from "date-fns";

export type RecurrenceRule = { startDate: string; weeks: number; weekdays: number[] };
export type SessionEntry = {
  id: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  recurrenceGroupId: string | null;
  recurrenceRule: RecurrenceRule | null;
};
export type SessionDisplayGroup = {
  sessions: [SessionEntry, ...SessionEntry[]];
  repeatWeekdays: number[];
  repeatWeeks: number;
};

function nonemptySessions(sessions: SessionEntry[]): [SessionEntry, ...SessionEntry[]] | null {
  const [first, ...rest] = sessions;
  return first ? [first, ...rest] : null;
}

export function groupSessionsForDisplay(
  sessions: SessionEntry[],
  expandedSessionIds: Set<string>
): SessionDisplayGroup[] {
  const weeklyBuckets = new Map<string, SessionEntry[]>();
  const singles: SessionDisplayGroup[] = [];

  for (const session of sessions) {
    if (!session.sessionDate || !session.recurrenceGroupId || expandedSessionIds.has(session.id)) {
      singles.push({ sessions: [session], repeatWeekdays: [], repeatWeeks: 0 });
      continue;
    }

    const weekday = getDay(parseISO(session.sessionDate)) || 7;
    const key = `${session.recurrenceGroupId}|${session.startTime}|${session.endTime}|${weekday}`;
    const bucket = weeklyBuckets.get(key) ?? [];
    bucket.push(session);
    weeklyBuckets.set(key, bucket);
  }

  const weeklySequences: [SessionEntry, ...SessionEntry[]][] = [];
  for (const bucket of weeklyBuckets.values()) {
    const ordered = bucket.slice().sort((a, b) => a.sessionDate.localeCompare(b.sessionDate));
    let sequence: SessionEntry[] = [];

    for (const session of ordered) {
      const previous = sequence.at(-1);
      if (
        previous &&
        differenceInCalendarDays(parseISO(session.sessionDate), parseISO(previous.sessionDate)) !==
          7
      ) {
        const completed = nonemptySessions(sequence);
        if (completed && completed.length > 1) weeklySequences.push(completed);
        else if (completed)
          singles.push({ sessions: completed, repeatWeekdays: [], repeatWeeks: 0 });
        sequence = [];
      }
      sequence.push(session);
    }

    const completed = nonemptySessions(sequence);
    if (completed && completed.length > 1) weeklySequences.push(completed);
    else if (completed) singles.push({ sessions: completed, repeatWeekdays: [], repeatWeeks: 0 });
  }

  const weeklyGroups: SessionDisplayGroup[][] = [];
  for (const sequence of weeklySequences) {
    const first = sequence[0];
    const last = sequence.at(-1) ?? first;
    const weekday = getDay(parseISO(first.sessionDate)) || 7;
    const matchingGroup = weeklyGroups.find((group) => {
      const groupedSessions = group.flatMap((item) => item.sessions);
      const groupedFirst = groupedSessions[0];
      const groupedLast = groupedSessions.at(-1);
      if (!groupedFirst || !groupedLast) return false;
      return (
        groupedFirst.recurrenceGroupId === first.recurrenceGroupId &&
        groupedFirst.startTime === first.startTime &&
        groupedFirst.endTime === first.endTime &&
        group.every((item) => item.sessions.length === sequence.length) &&
        Math.abs(
          differenceInCalendarDays(parseISO(first.sessionDate), parseISO(groupedFirst.sessionDate))
        ) <= 6 &&
        Math.abs(
          differenceInCalendarDays(parseISO(last.sessionDate), parseISO(groupedLast.sessionDate))
        ) <= 6
      );
    });
    const item = {
      sessions: sequence,
      repeatWeekdays: [weekday],
      repeatWeeks: sequence.length,
    };
    if (matchingGroup) matchingGroup.push(item);
    else weeklyGroups.push([item]);
  }

  const repeated: SessionDisplayGroup[] = [];
  for (const group of weeklyGroups) {
    const sessions = nonemptySessions(
      group
        .flatMap((item) => item.sessions)
        .sort((a, b) => a.sessionDate.localeCompare(b.sessionDate))
    );
    if (!sessions) continue;
    repeated.push({
      sessions,
      repeatWeekdays: group.flatMap((item) => item.repeatWeekdays).sort((a, b) => a - b),
      repeatWeeks: Math.max(...group.map((item) => item.repeatWeeks)),
    });
  }

  return [...singles, ...repeated].sort((a, b) => {
    const aDate = a.sessions[0].sessionDate;
    const bDate = b.sessions[0].sessionDate;
    if (!aDate) return 1;
    if (!bDate) return -1;
    return aDate.localeCompare(bDate);
  });
}

export function generateRecurringSessions(
  existing: SessionEntry[],
  rule: RecurrenceRule,
  startTime: string,
  endTime: string,
  cohortEndDate: string,
  groupId: string
): { status: "added"; sessions: SessionEntry[] } | { status: "capacity"; remaining: number } {
  const keys = new Set(existing.map((s) => `${s.sessionDate}|${s.startTime}|${s.endTime}`));
  const generated: SessionEntry[] = [];
  const first = parseISO(rule.startDate);
  for (let offset = 0; offset < rule.weeks * 7; offset++) {
    const date = addDays(first, offset);
    if (!rule.weekdays.includes(getDay(date) || 7)) continue;
    const sessionDate = format(date, "yyyy-MM-dd");
    if (cohortEndDate && sessionDate > cohortEndDate) continue;
    const key = `${sessionDate}|${startTime}|${endTime}`;
    if (keys.has(key)) continue;
    keys.add(key);
    generated.push({
      id: `${groupId}-${offset}`,
      sessionDate,
      startTime,
      endTime,
      recurrenceGroupId: groupId,
      recurrenceRule: rule,
    });
  }
  if (existing.length + generated.length > 50)
    return { status: "capacity", remaining: Math.max(0, 50 - existing.length) };
  return { status: "added", sessions: [...existing, ...generated] };
}

export function updateSessionGroup(
  sessions: SessionEntry[],
  ids: string[],
  field: "sessionDate" | "startTime" | "endTime",
  value: string
): SessionEntry[] {
  const selected = new Set(ids);
  const first = sessions.find((s) => s.id === ids[0]);
  if (!first) return sessions;
  const offset =
    field === "sessionDate" && value && first.sessionDate
      ? differenceInCalendarDays(parseISO(value), parseISO(first.sessionDate))
      : 0;
  const fullGroup =
    first.recurrenceGroupId &&
    sessions
      .filter((s) => s.recurrenceGroupId === first.recurrenceGroupId)
      .every((s) => selected.has(s.id));
  return sessions.map((s) => {
    if (!selected.has(s.id)) return s;
    if (field !== "sessionDate" || !value || !first.sessionDate) return { ...s, [field]: value };
    if (!offset) return s;
    const recurrenceRule =
      fullGroup && s.recurrenceRule
        ? {
            ...s.recurrenceRule,
            startDate: format(addDays(parseISO(s.recurrenceRule.startDate), offset), "yyyy-MM-dd"),
            weekdays: s.recurrenceRule.weekdays
              .map((day) => ((((day - 1 + offset) % 7) + 7) % 7) + 1)
              .sort((a, b) => a - b),
          }
        : s.recurrenceRule;
    return {
      ...s,
      sessionDate: format(addDays(parseISO(s.sessionDate), offset), "yyyy-MM-dd"),
      recurrenceRule,
    };
  });
}

/** Async-only cohorts clear their saved schedule; retain the caller's draft for retry. */
export function prepareSessionSubmission(sessions: SessionEntry[], interactionModes: string[]) {
  const submittedSessions = interactionModes.some((mode) => mode === "sync" || mode === "physical")
    ? sessions
    : [];
  return {
    sessions: submittedSessions,
    invalidSessionIds: submittedSessions
      .filter((session) => !session.sessionDate)
      .map((session) => session.id),
  };
}
