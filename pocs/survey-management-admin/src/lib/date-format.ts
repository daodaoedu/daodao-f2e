import { format, isValid } from "date-fns";

type DateInput = string | number | Date | null | undefined;

function parseDate(value: DateInput): Date | null {
  if (value === null || value === undefined || value === "") return null;
  const date = value instanceof Date ? value : new Date(value);
  return isValid(date) ? date : null;
}

export function formatAdminDate(value: DateInput, fallback = "—"): string {
  const date = parseDate(value);
  return date ? format(date, "yyyy/MM/dd") : fallback;
}

export function formatAdminDateTime(value: DateInput, fallback = "—"): string {
  const date = parseDate(value);
  return date ? format(date, "yyyy/MM/dd HH:mm") : fallback;
}

export function formatAdminDateTimeWithSeconds(value: DateInput, fallback = "—"): string {
  const date = parseDate(value);
  return date ? format(date, "yyyy/MM/dd HH:mm:ss") : fallback;
}
