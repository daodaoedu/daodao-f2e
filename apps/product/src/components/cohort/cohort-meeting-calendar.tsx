"use client";

import { useTranslations } from "@daodao/i18n";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@daodao/ui/components/animate-ui/components/radix/dialog";
import { Button } from "@daodao/ui/components/button";
import { CalendarDays, Clock3, MapPin, Video, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  groupMeetingSessions,
  type MeetingSessionType,
  resolveMeetingTimezone,
} from "@/utils/cohort-meeting-calendar";
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

function SessionDateTime({
  session,
  sourceTimezone,
  displayTimezone,
  highlight = false,
}: {
  session: MeetingSessionType;
  sourceTimezone: string;
  displayTimezone: string;
  highlight?: boolean;
}) {
  const t = useTranslations("cohort");
  const display = formatSessionForTimezone(session, sourceTimezone, displayTimezone);
  const time =
    display.startTime && display.endTime
      ? `${display.startTime}–${display.endTime}`
      : display.startTime || display.endTime || t("session_schedule_time_not_set");

  return (
    <div className="min-w-0 w-full">
      <div className="flex items-baseline justify-between gap-2 whitespace-nowrap">
        <span
          className={
            highlight
              ? "text-base font-semibold leading-6 text-text-dark dark:text-foreground"
              : "text-sm font-medium text-text-dark dark:text-foreground"
          }
        >
          {display.date}
        </span>
        <span className="inline-flex shrink-0 items-center gap-1.5 text-sm text-text-dark/80 dark:text-foreground/80">
          {highlight && (
            <Clock3
              className="hidden min-[360px]:block size-4 shrink-0 text-[#0D7773] dark:text-[#8AD9D3]"
              aria-hidden="true"
            />
          )}
          {time}
        </span>
      </div>
      {display.endDate && display.endDate !== display.date && (
        <p className="mt-1 text-xs text-text-dark/80 dark:text-foreground/80">
          {t("session_schedule_end_date", { date: display.endDate })}
        </p>
      )}
    </div>
  );
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
  // The current account contract has no timezone field; use the existing device fallback.
  const resolvedTimezone = resolveMeetingTimezone(eventTimezone, undefined, participantTimezone);
  const displayTimezone = resolvedTimezone.timezone;

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
        showCloseButton={false}
        className="max-h-[85dvh] overflow-y-auto w-[min(520px,94vw)] gap-0 rounded-2xl p-5 sm:max-w-none"
      >
        <DialogClose asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t("session_schedule_close")}
            className="absolute right-3 top-3 size-9 rounded-full bg-white text-[#3D4B4D] hover:bg-white focus-visible:ring-2"
          >
            <X className="size-4" aria-hidden="true" />
          </Button>
        </DialogClose>
        <DialogHeader className="sr-only">
          <DialogTitle>{t("session_schedule_title")}</DialogTitle>
        </DialogHeader>

        {nextSession ? (
          <div className="rounded-xl bg-[#F5FBFA] dark:bg-[#163C3A] pl-4 pr-8 py-2.5">
            <p className="mb-0.5 text-xs font-medium text-[#0D7773] dark:text-[#8AD9D3]">
              {t("session_schedule_next")}
            </p>
            <SessionDateTime
              session={nextSession}
              sourceTimezone={eventTimezone}
              displayTimezone={displayTimezone}
              highlight
            />
          </div>
        ) : (
          <p className="rounded-xl bg-[#F5FBFA] dark:bg-[#163C3A] px-4 py-3.5 text-sm text-text-dark/80 dark:text-foreground/80">
            {sessions.length > 0
              ? t("session_schedule_no_upcoming")
              : t("session_schedule_not_published")}
          </p>
        )}

        {sessions.length > 0 && (
          <p className="mt-2 text-xs text-text-dark/80 dark:text-foreground/80">
            {t(
              resolvedTimezone.source === "participant"
                ? "session_schedule_user_timezone"
                : "session_schedule_cohort_timezone",
              { timezone: displayTimezone }
            )}
          </p>
        )}

        {(location || meetingUrl) && (
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-text-dark/80 dark:text-foreground/80">
            {location && (
              <span className="inline-flex min-w-0 items-center gap-1.5 [overflow-wrap:anywhere]">
                <MapPin
                  className="size-4 shrink-0 text-[#0D7773] dark:text-[#8AD9D3]"
                  aria-hidden="true"
                />
                {location}
              </span>
            )}
            {meetingUrl && (
              <a
                href={meetingUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 font-medium text-[#0D7773] dark:text-[#8AD9D3] underline-offset-2 hover:underline"
              >
                <Video className="size-4" aria-hidden="true" />
                {t("session_schedule_join_online")}
              </a>
            )}
          </div>
        )}

        {inProgressSessions.length > 0 && (
          <section className="mt-5">
            <h3 className="mb-1 text-xs font-semibold text-text-dark/80 dark:text-foreground/80">
              {t("session_schedule_in_progress")}
            </h3>
            <ol className="divide-y divide-[#E7F0EF] rounded-xl border border-[#E7F0EF] px-3.5">
              {inProgressSessions.map((session) => (
                <li key={session.id} className="py-3">
                  <SessionDateTime
                    session={session}
                    sourceTimezone={eventTimezone}
                    displayTimezone={displayTimezone}
                  />
                </li>
              ))}
            </ol>
          </section>
        )}

        {otherSessions.length > 0 && (
          <section className="mt-5">
            <h3 className="mb-1 text-xs font-semibold text-text-dark/80 dark:text-foreground/80">
              {t("session_schedule_upcoming")}
            </h3>
            <ol className="divide-y divide-[#E7F0EF] rounded-xl border border-[#E7F0EF] px-3.5">
              {otherSessions.map((session) => (
                <li key={session.id} className="py-3">
                  <SessionDateTime
                    session={session}
                    sourceTimezone={eventTimezone}
                    displayTimezone={displayTimezone}
                  />
                </li>
              ))}
            </ol>
          </section>
        )}

        {pastSessions.length > 0 && (
          <section className="mt-5">
            <h3 className="mb-1 text-xs font-semibold text-text-dark/80 dark:text-foreground/80">
              {t("session_schedule_past")}
            </h3>
            <ol className="divide-y divide-[#E7F0EF] rounded-xl border border-[#E7F0EF] px-3.5">
              {pastSessions.map((session) => (
                <li key={session.id} className="py-3">
                  <SessionDateTime
                    session={session}
                    sourceTimezone={eventTimezone}
                    displayTimezone={displayTimezone}
                  />
                </li>
              ))}
            </ol>
          </section>
        )}
      </DialogContent>
    </Dialog>
  );
}
