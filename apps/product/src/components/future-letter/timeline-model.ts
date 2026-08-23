import type { FutureLetterType, TimelineEntryType } from "@daodao/api";
import { differenceInCalendarDays, format, parseISO, startOfDay } from "date-fns";

export type TimelineNodeKind =
  | "check-in"
  | "milestone"
  | "learning-dna"
  | "scheduled"
  | "delivered-unopened"
  | "opened"
  | "today";

export interface TimelineCoordinate {
  id: string;
  kind: TimelineNodeKind;
  date: string;
  dateLabel: string;
  monthLabel?: string;
  title?: string;
  letterId?: string;
  daysRemaining?: number;
}

type LetterWithLifecycle = FutureLetterType & {
  openedAt?: string | null;
};

export function buildTimelineCoordinates(
  entries: TimelineEntryType[],
  letters: FutureLetterType[],
  now: Date
): TimelineCoordinate[] {
  const today = startOfDay(now);
  const representedLetterIds = new Set(letters.map((letter) => letter.id));
  const eventNodes = entries.flatMap<TimelineCoordinate>((entry, index) => {
    if (entry.type === "letter") {
      const letterId = typeof entry.meta.letterId === "string" ? entry.meta.letterId : undefined;
      const status = entry.meta.status;
      if (!letterId || representedLetterIds.has(letterId)) return [];
      if (status !== "scheduled" && status !== "delivered") return [];
      const openedAt = typeof entry.meta.openedAt === "string" ? entry.meta.openedAt : null;
      const kind: TimelineNodeKind =
        status === "scheduled" ? "scheduled" : openedAt ? "opened" : "delivered-unopened";
      return [
        {
          id: `letter-${letterId}`,
          kind,
          date: entry.date,
          dateLabel: format(parseISO(entry.date), "MM/dd"),
          letterId,
          daysRemaining:
            kind === "scheduled"
              ? Math.max(0, differenceInCalendarDays(parseISO(entry.date), today))
              : undefined,
        },
      ];
    }
    return [
      {
        id: `${entry.type}-${entry.date}-${index}`,
        kind: entry.type,
        date: entry.date,
        dateLabel: format(parseISO(entry.date), "MM/dd"),
        title: entry.title,
      },
    ];
  });
  const letterNodes: TimelineCoordinate[] = letters.flatMap((rawLetter) => {
    const letter = rawLetter as LetterWithLifecycle;
    if (letter.status !== "scheduled" && letter.status !== "delivered") return [];
    const coordinateDate = letter.deliverAt ?? letter.deliveredAt;
    if (!coordinateDate) return [];
    const kind: TimelineNodeKind =
      letter.status === "scheduled"
        ? "scheduled"
        : letter.openedAt
          ? "opened"
          : "delivered-unopened";
    return [
      {
        id: `letter-${letter.id}`,
        kind,
        date: coordinateDate,
        dateLabel: format(parseISO(coordinateDate), "MM/dd"),
        letterId: letter.id,
        daysRemaining:
          kind === "scheduled"
            ? Math.max(0, differenceInCalendarDays(parseISO(coordinateDate), today))
            : undefined,
      },
    ];
  });
  const todayNode: TimelineCoordinate = {
    id: "today",
    kind: "today",
    date: today.toISOString(),
    dateLabel: format(today, "MM/dd"),
  };
  const sorted = [...eventNodes, todayNode, ...letterNodes].sort(
    (a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id)
  );
  let previousMonth = "";
  return sorted.map((node) => {
    const month = format(parseISO(node.date), "yyyy / MM");
    const monthLabel = month === previousMonth ? undefined : month;
    previousMonth = month;
    return { ...node, monthLabel };
  });
}

export interface FootprintLetterCard {
  id: string;
  letterId: string;
  date: string;
  status: "scheduled" | "delivered";
  opened: boolean;
  daysRemaining?: number;
  sentAt?: string | null;
  practiceTitle?: string | null;
}

export interface FootprintEventCard {
  id: string;
  kind: "check-in" | "milestone" | "learning-dna";
  date: string;
  title: string;
  description: string | null;
}

export type FootprintTimelineItem =
  | { type: "letter"; card: FootprintLetterCard }
  | { type: "event"; card: FootprintEventCard }
  | { type: "collapsed-check-ins"; id: string; items: FootprintEventCard[] };

export interface FootprintMonthGroup {
  key: string;
  label: string;
  items: FootprintTimelineItem[];
}

export interface FootprintTimeline {
  futureLetters: FootprintLetterCard[];
  pastGroups: FootprintMonthGroup[];
}

function toLetterCard(
  entryLetterId: string,
  entryDate: string,
  status: "scheduled" | "delivered",
  now: Date,
  lettersById: Map<string, FutureLetterType>
): FootprintLetterCard {
  const letter = lettersById.get(entryLetterId) as
    | (FutureLetterType & { sentAt?: string | null; openedAt?: string | null })
    | undefined;
  return {
    id: `letter-${entryLetterId}`,
    letterId: entryLetterId,
    date: entryDate,
    status,
    opened: Boolean(letter?.openedAt),
    daysRemaining:
      status === "scheduled"
        ? Math.max(0, differenceInCalendarDays(parseISO(entryDate), startOfDay(now)))
        : undefined,
    sentAt: letter?.sentAt ?? letter?.createdAt ?? null,
    practiceTitle: letter?.practice?.title ?? null,
  };
}

/** Build the vertical "footprints" timeline: upcoming/pending letters, then a mixed
 *  past feed (delivered letters, check-ins, milestones, learning-DNA) grouped by month,
 *  with note-less check-ins collapsed into a single row per group. */
export function buildFootprintTimeline(
  entries: TimelineEntryType[],
  letters: FutureLetterType[],
  now: Date
): FootprintTimeline {
  const lettersById = new Map(letters.map((letter) => [letter.id, letter]));

  const futureLetters: FootprintLetterCard[] = letters
    .filter((letter) => letter.status === "scheduled" && letter.deliverAt)
    .sort((a, b) => (b.deliverAt as string).localeCompare(a.deliverAt as string))
    .map((letter) => toLetterCard(letter.id, letter.deliverAt as string, "scheduled", now, lettersById));

  const pastGroups: FootprintMonthGroup[] = [];
  const groupsByKey = new Map<string, FootprintMonthGroup>();
  let bareCheckins: FootprintEventCard[] = [];
  let bareCheckinsGroupKey: string | undefined;

  const flushBareCheckins = () => {
    if (bareCheckins.length === 0 || !bareCheckinsGroupKey) return;
    const group = groupsByKey.get(bareCheckinsGroupKey);
    if (group) {
      group.items.push({
        type: "collapsed-check-ins",
        id: `collapsed-${bareCheckinsGroupKey}-${group.items.length}`,
        items: bareCheckins,
      });
    }
    bareCheckins = [];
  };

  entries.forEach((entry, index) => {
    const isScheduledLetter =
      entry.type === "letter" && (entry.meta.status as string | undefined) === "scheduled";
    if (isScheduledLetter) return;

    const monthKey = format(parseISO(entry.date), "yyyy / MM");
    if (monthKey !== bareCheckinsGroupKey) flushBareCheckins();
    if (!groupsByKey.has(monthKey)) {
      const group: FootprintMonthGroup = { key: monthKey, label: monthKey, items: [] };
      groupsByKey.set(monthKey, group);
      pastGroups.push(group);
    }
    const group = groupsByKey.get(monthKey) as FootprintMonthGroup;

    if (entry.type === "letter") {
      const letterId = typeof entry.meta.letterId === "string" ? entry.meta.letterId : undefined;
      if (!letterId) return;
      bareCheckinsGroupKey = monthKey;
      flushBareCheckins();
      group.items.push({
        type: "letter",
        card: toLetterCard(letterId, entry.date, "delivered", now, lettersById),
      });
      return;
    }

    if (entry.type === "check-in" && !entry.description) {
      bareCheckinsGroupKey = monthKey;
      bareCheckins.push({
        id: `event-${entry.type}-${entry.date}-${index}`,
        kind: entry.type,
        date: entry.date,
        title: entry.title,
        description: entry.description,
      });
      return;
    }

    bareCheckinsGroupKey = monthKey;
    flushBareCheckins();
    group.items.push({
      type: "event",
      card: {
        id: `event-${entry.type}-${entry.date}-${index}`,
        kind: entry.type as "check-in" | "milestone" | "learning-dna",
        date: entry.date,
        title: entry.title,
        description: entry.description,
      },
    });
  });
  flushBareCheckins();

  return { futureLetters, pastGroups };
}

export function getTimelineSummary(
  coordinates: TimelineCoordinate[],
  focusId: string | undefined,
  radius = 3
): TimelineCoordinate[] {
  if (coordinates.length <= radius * 2 + 1) return coordinates;
  const focusIndex = Math.max(
    0,
    coordinates.findIndex((node) => node.id === focusId || node.id === "today")
  );
  const start = Math.max(0, Math.min(focusIndex - radius, coordinates.length - (radius * 2 + 1)));
  return coordinates.slice(start, start + radius * 2 + 1);
}
