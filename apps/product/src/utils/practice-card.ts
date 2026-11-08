import { differenceInCalendarDays, format, isValid, parseISO } from "date-fns";
import { isPracticeEnded, parseLocalDate } from "./practice-period";

/**
 * Whether an active practice belongs on the dashboard within its scheduled date window.
 * Start and end dates are inclusive. Missing dates leave that side of the window open
 * for legacy practices; malformed provided dates are excluded from the dashboard.
 */
export function isPracticeVisibleByDate(
  startDate: string | null | undefined,
  endDate: string | null | undefined,
  now = new Date()
): boolean {
  const start = startDate ? parseLocalDate(startDate) : null;
  if (startDate && !start) return false;
  if (start && differenceInCalendarDays(now, start) < 0) return false;

  if (endDate && !parseLocalDate(endDate)) return false;
  return !isPracticeEnded(endDate, now);
}

export function calculateRemainingDays(endDate: string | null | undefined): number | null {
  if (!endDate) return null;
  const end = parseISO(endDate);
  if (!isValid(end)) return null;
  return differenceInCalendarDays(end, new Date());
}

export function calculateDaysProgress(
  startDate: string | null | undefined,
  endDate: string | null | undefined
): { elapsed: number; total: number } | null {
  if (!startDate || !endDate) return null;
  const start = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);
  if (!start || !end) return null;
  const total = differenceInCalendarDays(end, start) + 1;
  if (total <= 0) return null;
  const elapsed = Math.min(total, Math.max(0, differenceInCalendarDays(new Date(), start) + 1));
  return { elapsed, total };
}

export function formatCardDate(date: string | null | undefined): string | null {
  if (!date) return null;
  const parsed = parseLocalDate(date);
  if (!parsed) return null;
  return format(parsed, "yyyy/MM/dd");
}
