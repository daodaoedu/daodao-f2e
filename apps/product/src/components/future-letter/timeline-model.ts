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
