import { format, isValid, parseISO } from "date-fns";

/** Format the calendar date saved with a check-in, without changing its day. */
export function getCheckInDateLabel(date: string): { year: string; monthDay: string } {
  const parsed = parseISO(date.replace(/\./g, "-"));
  return {
    year: isValid(parsed) ? format(parsed, "yyyy") : date.split(/[.-]/)[0] || "",
    monthDay: isValid(parsed) ? format(parsed, "MM/dd") : date.split(/[.-]/).slice(1).join("/"),
  };
}
