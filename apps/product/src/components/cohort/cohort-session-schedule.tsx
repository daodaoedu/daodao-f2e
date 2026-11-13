"use client";

import { useTranslations } from "@daodao/i18n";
import { useEffect, useState } from "react";
import { weekdayIndexOf } from "@/utils/activity-detail";
import { formatSessionForTimezone, type ICohortSessionTime } from "@/utils/cohort-session-timezone";

interface CohortSessionScheduleProps {
  sessions: (ICohortSessionTime & { id: number })[];
  timezone?: string | null;
  /** 隱藏區塊標題（詳情頁以資訊列圖示與小標呈現）。 */
  hideHeading?: boolean;
}

/** Shared by the public activity, join, and participant pages. */
export function CohortSessionSchedule({
  sessions,
  timezone,
  hideHeading = false,
}: CohortSessionScheduleProps) {
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
      className={hideHeading ? "min-w-0" : "my-4 min-w-0"}
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
          return (
            <li
              key={session.id}
              className="flex flex-wrap gap-x-2 gap-y-0.5 text-sm text-text-dark"
            >
              <span>
                {display.date}
                {weekday !== null ? ` · ${t(`weekday_${weekday}`)}` : ""}
              </span>
              {(display.startTime || display.endTime) && (
                <span>
                  {display.startTime}
                  {display.startTime && display.endTime ? " – " : ""}
                  {endDate ? `${endDate} ` : ""}
                  {display.endTime}
                </span>
              )}
              <span className="break-all text-xs text-text-dark/60">{display.timezone}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
