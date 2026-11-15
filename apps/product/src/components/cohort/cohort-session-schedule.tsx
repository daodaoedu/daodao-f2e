"use client";

import { useTranslations } from "@daodao/i18n";
import { cn } from "@daodao/ui/lib/utils";
import { useEffect, useState } from "react";
import { weekdayIndexOf } from "@/utils/activity-detail";
import { formatSessionForTimezone, type ICohortSessionTime } from "@/utils/cohort-session-timezone";

const weekdayKeys = [
  "weekday_0",
  "weekday_1",
  "weekday_2",
  "weekday_3",
  "weekday_4",
  "weekday_5",
  "weekday_6",
] as const;

interface CohortSessionScheduleProps {
  sessions: (ICohortSessionTime & { id: number })[];
  timezone?: string | null;
  /** 隱藏區塊標題（詳情頁以資訊列圖示與小標呈現）。 */
  hideHeading?: boolean;
  className?: string;
}

/** Shared by the public activity, join, and participant pages. */
export function CohortSessionSchedule({
  sessions,
  timezone,
  hideHeading = false,
  className,
}: Readonly<CohortSessionScheduleProps>) {
  const t = useTranslations("cohort");
  const [participantTimezone, setParticipantTimezone] = useState<string>();

  useEffect(() => {
    try {
      setParticipantTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    } catch {
      // Keep the cohort timezone when the browser cannot resolve its own zone.
    }
  }, []);

  if (sessions.length === 0) return null;

  return (
    <section
      className={cn(hideHeading ? "min-w-0" : "my-4 min-w-0", className)}
      aria-label={t("meeting_schedule")}
    >
      {!hideHeading && (
        <h2 className="mb-2 text-sm font-medium text-text-dark">{t("meeting_schedule")}</h2>
      )}
      <ul className="flex flex-col gap-2">
        {sessions.map((session) => {
          const display = formatSessionForTimezone(session, timezone, participantTimezone);
          const endDate = display.endDate !== display.date ? display.endDate : null;
          const weekday = weekdayIndexOf(display.date);
          const weekdayKey = weekday === null ? undefined : weekdayKeys[weekday];
          const weekdayLabel = weekdayKey ? ` · ${t(weekdayKey)}` : "";
          return (
            <li
              key={session.id}
              className="flex flex-wrap gap-x-2 gap-y-0.5 text-sm text-text-dark"
            >
              <span>
                {display.date}
                {weekdayLabel}
              </span>
              {/* 時間與時區同一組換行，避免時區單獨掉到下一行 */}
              <span>
                {(display.startTime || display.endTime) && (
                  <>
                    {display.startTime}
                    {display.startTime && display.endTime ? " – " : ""}
                    {endDate ? `${endDate} ` : ""}
                    {display.endTime}{" "}
                  </>
                )}
                <span className="break-all text-xs leading-[18px] text-text-dark/60">
                  {display.timezone}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
