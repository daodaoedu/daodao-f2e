"use client";

import { useTranslations } from "@daodao/i18n";
import { useEffect, useState } from "react";
import { formatSessionForTimezone, type ICohortSessionTime } from "@/utils/cohort-session-timezone";

interface CohortSessionScheduleProps {
  sessions: (ICohortSessionTime & { id: number })[];
  timezone?: string | null;
}

/** Shared by the public activity, join, and participant pages. */
export function CohortSessionSchedule({ sessions, timezone }: CohortSessionScheduleProps) {
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
    <section className="my-4 min-w-0" aria-label={t("meeting_schedule")}>
      <h2 className="mb-2 text-sm font-medium text-text-dark">{t("meeting_schedule")}</h2>
      <ul className="flex flex-col gap-2">
        {sessions.map((session) => {
          const display = formatSessionForTimezone(session, timezone, participantTimezone);
          const endDate = display.endDate !== display.date ? display.endDate : null;
          return (
            <li
              key={session.id}
              className="flex flex-wrap gap-x-2 gap-y-0.5 text-sm text-text-dark"
            >
              <span>{display.date}</span>
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
