import { differenceInCalendarDays, format, isValid, parseISO } from "date-fns";

export function calculateRemainingDays(endDate: string | null | undefined): number | null {
  if (!endDate) return null;
  const end = parseISO(endDate);
  if (!isValid(end)) return null;
  return differenceInCalendarDays(end, new Date());
}

export function formatCardDate(date: string | null | undefined): string | null {
  if (!date) return null;
  const parsed = parseISO(date);
  if (!isValid(parsed)) return null;
  return format(parsed, "MM/dd");
}
