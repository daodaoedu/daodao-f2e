import { addDays, differenceInCalendarDays, format, isValid, parseISO } from "date-fns";

/** Read the calendar date without converting an API timestamp to the browser timezone. */
const parseCalendarDate = (value: string) => {
  const datePart = value.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return null;
  const date = parseISO(datePart);
  return isValid(date) && format(date, "yyyy-MM-dd") === datePart ? date : null;
};

/** Resolve a one-based resource day to the practice's calendar date. */
export const getResourceDate = (
  startDate: string,
  dayNumber: number | null | undefined
): string | null => {
  const start = parseCalendarDate(startDate);
  if (!start || dayNumber == null || !Number.isInteger(dayNumber) || dayNumber < 1) return null;
  return format(addDays(start, dayNumber - 1), "yyyy-MM-dd");
};

/** Convert a selected calendar date to a one-based day; range validation is separate. */
export const getResourceDayNumber = (startDate: string, date: string): number | null => {
  const start = parseCalendarDate(startDate);
  const selected = parseCalendarDate(date);
  if (!start || !selected) return null;
  return differenceInCalendarDays(selected, start) + 1;
};

/** Whole-period resources are valid; assigned days must belong to the inclusive duration. */
export const isResourceDayInRange = (
  dayNumber: number | null | undefined,
  durationDays: number
): boolean =>
  dayNumber == null || (Number.isInteger(dayNumber) && dayNumber >= 1 && dayNumber <= durationDays);
