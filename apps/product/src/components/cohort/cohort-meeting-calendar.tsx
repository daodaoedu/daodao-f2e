"use client";

import { useTranslations } from "@daodao/i18n";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@daodao/ui/components/animate-ui/components/radix/dialog";
import { Button } from "@daodao/ui/components/button";
import { CalendarDays, Clock3, MapPin, Video } from "lucide-react";
import { useEffect, useState } from "react";
import { groupMeetingSessions, type MeetingSessionType } from "@/utils/cohort-meeting-calendar";
import {
  formatSessionForTimezone,
  resolveParticipantTimezone,
} from "@/utils/cohort-session-timezone";

interface CohortMeetingCalendarProps {
  sessions: MeetingSessionType[];
  sourceTimezone?: string | null;
  location?: string | null;
  meetingUrl?: string | null;
}

function formatSessionDate(
  session: MeetingSessionType,
  sourceTimezone: string,
  displayTimezone: string
) {
  return formatSessionForTimezone(session, sourceTimezone, displayTimezone).date;
}

function formatSessionTime(
  session: MeetingSessionType,
  notSetLabel: string,
  sourceTimezone: string,
  displayTimezone: string
) {
  const display = formatSessionForTimezone(session, sourceTimezone, displayTimezone);
  const endDate = display.endDate && display.endDate !== display.date ? `${display.endDate} ` : "";
  if (display.startTime && display.endTime)
    return `${display.startTime}–${endDate}${display.endTime}`;
  return display.startTime || display.endTime || notSetLabel;
}

export function CohortMeetingCalendar({
  sessions,
  sourceTimezone,
  location,
  meetingUrl,
}: CohortMeetingCalendarProps) {
  const t = useTranslations("cohort");
  const eventTimezone = resolveParticipantTimezone(sourceTimezone, undefined);
  const [open, setOpen] = useState(false);
  const [participantTimezone, setParticipantTimezone] = useState<string>();
  const [now, setNow] = useState(() => new Date());
  const displayTimezone = resolveParticipantTimezone(eventTimezone, participantTimezone);

  useEffect(() => {
    try {
      setParticipantTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    } catch {
      // Fall back to the cohort zone without calling it the user's zone.
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, [open]);

  const { pastSessions, inProgressSessions, nextSession, otherSessions } = groupMeetingSessions(
    sessions,
    eventTimezone,
    now
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        setNow(new Date());
      }}
    >
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t("session_schedule_title")}
          className="size-9 shrink-0 text-text-dark/60"
        >
          <CalendarDays className="size-5" aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent
        aria-describedby={undefined}
        className="max-h-[85dvh] overflow-y-auto w-[min(520px,94vw)] gap-0 rounded-2xl p-5 sm:max-w-none [&_button[data-slot=dialog-close]]:rounded-full [&_button[data-slot=dialog-close]]:bg-white [&_button[data-slot=dialog-close]]:p-1 [&_button[data-slot=dialog-close]]:focus:ring-2 [&_button[data-slot=dialog-close]]:focus:ring-offset-2 [&_button[data-slot=dialog-close]>svg]:size-4 [&_button[data-slot=dialog-close]>svg]:text-text-dark/60"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{t("session_schedule_title")}</DialogTitle>
        </DialogHeader>

        {nextSession ? (
          <div className="rounded-xl bg-[#F5FBFA] pl-4 pr-8 py-2.5">
            <p className="mb-0.5 text-xs font-medium text-[#0D7773]">
              {t("session_schedule_next")}
            </p>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <p className="text-base font-semibold leading-6 text-text-dark">
                {formatSessionDate(nextSession, eventTimezone, displayTimezone)}
              </p>
              <p className="flex items-center gap-1.5 text-sm text-text-dark/70">
                <Clock3 className="size-4 shrink-0 text-[#0D7773]" aria-hidden="true" />
                {formatSessionTime(
                  nextSession,
                  t("session_schedule_time_not_set"),
                  eventTimezone,
                  displayTimezone
                )}
              </p>
            </div>
          </div>
        ) : (
          <p className="rounded-xl bg-[#F5FBFA] px-4 py-3.5 text-sm text-text-dark/65">
            {sessions.length > 0
              ? t("session_schedule_no_upcoming")
              : t("session_schedule_not_published")}
          </p>
        )}

        {sessions.length > 0 && (
          <p className="mt-2 text-xs text-text-dark/55">
            {t(
              participantTimezone
                ? "session_schedule_user_timezone"
                : "session_schedule_cohort_timezone",
              { timezone: displayTimezone }
            )}
          </p>
        )}

        {(location || meetingUrl) && (
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-text-dark/65">
            {location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-4 text-[#0D7773]" aria-hidden="true" />
                {location}
              </span>
            )}
            {meetingUrl && (
              <a
                href={meetingUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 font-medium text-[#0D7773] underline-offset-2 hover:underline"
              >
                <Video className="size-4" aria-hidden="true" />
                {t("session_schedule_join_online")}
              </a>
            )}
          </div>
        )}

        {inProgressSessions.length > 0 && (
          <section className="mt-5">
            <h3 className="mb-1 text-xs font-semibold text-text-dark/55">
              {t("session_schedule_in_progress")}
            </h3>
            <ol className="divide-y divide-[#E7F0EF] rounded-xl border border-[#E7F0EF] px-3.5">
              {inProgressSessions.map((session) => (
                <li key={session.id} className="flex items-center justify-between gap-3 py-3">
                  <span className="text-sm font-medium text-text-dark">
                    {formatSessionDate(session, eventTimezone, displayTimezone)}
                  </span>
                  <span className="shrink-0 text-sm text-text-dark/65">
                    {formatSessionTime(
                      session,
                      t("session_schedule_time_not_set"),
                      eventTimezone,
                      displayTimezone
                    )}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {otherSessions.length > 0 && (
          <section className="mt-5">
            <h3 className="mb-1 text-xs font-semibold text-text-dark/55">
              {t("session_schedule_upcoming")}
            </h3>
            <ol className="divide-y divide-[#E7F0EF] rounded-xl border border-[#E7F0EF] px-3.5">
              {otherSessions.map((session) => (
                <li key={session.id} className="flex items-center justify-between gap-3 py-3">
                  <span className="text-sm font-medium text-text-dark">
                    {formatSessionDate(session, eventTimezone, displayTimezone)}
                  </span>
                  <span className="shrink-0 text-sm text-text-dark/65">
                    {formatSessionTime(
                      session,
                      t("session_schedule_time_not_set"),
                      eventTimezone,
                      displayTimezone
                    )}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {pastSessions.length > 0 && (
          <section className="mt-5">
            <h3 className="mb-1 text-xs font-semibold text-text-dark/55">
              {t("session_schedule_past")}
            </h3>
            <ol className="divide-y divide-[#E7F0EF] rounded-xl border border-[#E7F0EF] px-3.5">
              {pastSessions.map((session) => (
                <li key={session.id} className="flex items-center justify-between gap-3 py-3">
                  <span className="text-sm font-medium text-text-dark">
                    {formatSessionDate(session, eventTimezone, displayTimezone)}
                  </span>
                  <span className="shrink-0 text-sm text-text-dark/65">
                    {formatSessionTime(
                      session,
                      t("session_schedule_time_not_set"),
                      eventTimezone,
                      displayTimezone
                    )}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        )}
      </DialogContent>
    </Dialog>
  );
}
