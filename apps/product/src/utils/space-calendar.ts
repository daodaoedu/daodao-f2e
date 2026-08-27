/** Calendar-block display helpers (FR-9.2/9.3). */

export interface SpaceCalendarEventRow {
  id: number;
  title: string;
  startDate: string;
  endDate: string | null;
  startTime: string | null;
  endTime: string | null;
  location: string | null;
  url: string | null;
}

/** Format YYYY-MM-DD as YYYY/MM/DD (FR-9.2). */
export function formatEventDate(date: string): string {
  return date.replaceAll("-", "/");
}

/** Month separator label; includes the year when it crosses years (FR-9.3). */
function monthLabel(date: string, needsYear: boolean): string {
  const [year, month] = date.split("-");
  return needsYear ? `${year} 年 ${Number(month)} 月` : `${Number(month)} 月`;
}

/** Sort events by start date and insert month separators (FR-9.3). */
export function groupEventsByMonth<T extends SpaceCalendarEventRow>(
  events: T[]
): Array<{ label: string; rows: T[] }> {
  const sorted = [...events].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const years = new Set(sorted.map((event) => event.startDate.slice(0, 4)));
  const needsYear = years.size > 1;
  const groups: Array<{ label: string; rows: T[] }> = [];
  for (const event of sorted) {
    const label = monthLabel(event.startDate, needsYear);
    const last = groups.at(-1);
    if (last && last.label === label) {
      last.rows.push(event);
    } else {
      groups.push({ label, rows: [event] });
    }
  }
  return groups;
}
