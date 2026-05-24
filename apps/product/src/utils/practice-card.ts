import { differenceInCalendarDays, format, isValid, parseISO } from "date-fns";

export function calculateRemainingDays(endDate: string | null | undefined): number | null {
  if (!endDate) return null;
  const end = parseISO(endDate);
  if (!isValid(end)) return null;
  return differenceInCalendarDays(end, new Date());
}

export function calculateDaysProgress(
  startDate: string | null | undefined,
  endDate: string | null | undefined,
): { elapsed: number; total: number } | null {
  if (!startDate || !endDate) return null;
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  if (!isValid(start) || !isValid(end)) return null;
  const total = differenceInCalendarDays(end, start);
  if (total <= 0) return null;
  const elapsed = Math.min(total, Math.max(0, differenceInCalendarDays(new Date(), start)));
  return { elapsed, total };
}

export function formatCardDate(date: string | null | undefined): string | null {
  if (!date) return null;
  const parsed = parseISO(date);
  if (!isValid(parsed)) return null;
  return format(parsed, "MM/dd");
}
