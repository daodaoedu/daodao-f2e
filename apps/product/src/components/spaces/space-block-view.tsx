"use client";

import type { SpaceBlockType } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { CalendarDays, FolderOpen, Link2, MapPin } from "lucide-react";
import { Fragment } from "react";

/** Format YYYY-MM-DD as YYYY/MM/DD (FR-9.2). */
function formatEventDate(date: string): string {
  return date.replaceAll("-", "/");
}

/** Month separator label; includes the year when it crosses years (FR-9.3). */
function monthLabel(date: string, needsYear: boolean): string {
  const [year, month] = date.split("-");
  return needsYear ? `${year} 年 ${Number(month)} 月` : `${Number(month)} 月`;
}

type EventRow = SpaceBlockType["events"][number];

/** Sort events by start date and insert month separators (FR-9.3). */
export function groupEventsByMonth(events: EventRow[]): Array<{ label: string; rows: EventRow[] }> {
  const sorted = [...events].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const years = new Set(sorted.map((event) => event.startDate.slice(0, 4)));
  const needsYear = years.size > 1;
  const groups: Array<{ label: string; rows: EventRow[] }> = [];
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

/** Link pill label: Google Meet gets its own name, everything else 線上連結 (FR-9.2). */
function linkPillLabel(url: string, onlineLinkText: string): string {
  return url.includes("meet.google.com") ? "Google Meet" : onlineLinkText;
}

interface SpaceBlockViewProps {
  block: SpaceBlockType;
}

/** Read-only block content shared by host, member and guest views. */
export const SpaceBlockView = ({ block }: SpaceBlockViewProps) => {
  const t = useTranslations("space");

  if (block.blockType === "text") {
    return (
      <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-text-dark">{block.body}</p>
    );
  }

  if (block.blockType === "resources") {
    return (
      <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
        {block.links.map((link) => (
          <li key={link.id} className="flex items-center gap-2.5">
            <Link2 className="size-4 shrink-0 text-primary-base" />
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-0 flex-1 truncate text-sm font-medium text-text-dark hover:text-primary-base"
            >
              {link.name || link.url}
            </a>
            <span className="max-w-[180px] truncate text-xs text-text-dark/40">{link.url}</span>
            {link.practices.length > 0 && (
              <span className="group relative inline-flex shrink-0">
                <FolderOpen className="size-4 text-logo-orange" />
                {/* 滑鼠停留列出對應實踐（FR-8.9） */}
                <span className="pointer-events-none absolute right-0 top-full z-20 mt-1 hidden w-max max-w-[220px] rounded-lg bg-basic-600 px-2.5 py-1.5 text-xs text-white group-hover:block">
                  {link.practices.map((practice) => practice.title).join("、")}
                </span>
              </span>
            )}
          </li>
        ))}
      </ul>
    );
  }

  const groups = groupEventsByMonth(block.events);
  return (
    <div className="flex flex-col gap-2">
      {groups.map((group) => (
        <Fragment key={group.label}>
          <p className="mb-0.5 mt-1 text-xs font-semibold text-text-dark/45">{group.label}</p>
          {group.rows.map((event) => (
            <div key={event.id} className="rounded-xl bg-[#F7FBFA] px-3.5 py-2.5">
              <div className="flex items-baseline gap-2.5">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-darker">
                  <CalendarDays className="size-3.5" />
                  {formatEventDate(event.startDate)}
                  {event.endDate ? `–${formatEventDate(event.endDate)}` : ""}
                </span>
                {event.startTime && (
                  <span className="text-xs text-text-dark/60">
                    {event.startTime}
                    {event.endTime ? `–${event.endTime}` : ""}
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-sm font-medium text-text-dark">{event.title}</p>
              {(event.location || event.url) && (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {event.location && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-xs text-text-dark/70">
                      <MapPin className="size-3" />
                      {event.location}
                    </span>
                  )}
                  {event.url && (
                    <a
                      href={event.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-xs text-primary-base hover:underline"
                    >
                      <Link2 className="size-3" />
                      {linkPillLabel(event.url, t("online_link"))}
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </Fragment>
      ))}
    </div>
  );
};
