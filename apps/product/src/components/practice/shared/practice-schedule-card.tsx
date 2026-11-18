"use client";

import { useTranslations } from "@daodao/i18n";
import { format } from "date-fns";
import { CalendarDays } from "lucide-react";
import { parseLocalDate, practiceEndDate, practiceRemainingDays } from "@/utils/practice-period";

interface PracticeScheduleCardProps {
  durationDays: number | null;
  startDate: string | null;
}

export const PracticeScheduleCard = ({ durationDays, startDate }: PracticeScheduleCardProps) => {
  const t = useTranslations("practice");
  const start = startDate ? parseLocalDate(startDate) : null;
  const hasDuration = durationDays !== null && durationDays > 0;
  const end = start && hasDuration ? practiceEndDate(start, durationDays) : null;
  const remainingDays =
    start && hasDuration ? practiceRemainingDays(start, durationDays, new Date()) : null;
  const elapsedDays =
    hasDuration && remainingDays !== null ? durationDays - remainingDays : null;
  const progressPercent =
    hasDuration && elapsedDays !== null ? Math.round((elapsedDays / durationDays) * 100) : 0;
  const progressDescription =
    hasDuration && elapsedDays !== null && remainingDays !== null
      ? t("schedule_progress_value", {
          elapsed: elapsedDays,
          total: durationDays,
          remaining: remainingDays,
        })
      : undefined;

  return (
    <div className="space-y-2 rounded-lg bg-very-light-blue px-5 py-3 md:px-6 md:py-4">
      {start && end && (
        <div className="flex items-center gap-2 text-xs text-text-dark">
          <CalendarDays aria-hidden="true" className="size-4 shrink-0 text-logo-cyan" />
          <div>
            <time dateTime={format(start, "yyyy-MM-dd")}>{format(start, "yyyy/MM/dd")}</time>
            <span aria-hidden="true" className="px-2">
              –
            </span>
            <time dateTime={format(end, "yyyy-MM-dd")}>{format(end, "yyyy/MM/dd")}</time>
          </div>
        </div>
      )}

      {hasDuration && (
        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-3 text-xs">
            <div className="font-medium text-text-dark">
              {elapsedDays !== null
                ? t("schedule_elapsed_days", { elapsed: elapsedDays, total: durationDays })
                : t("schedule_duration_total", { total: durationDays })}
            </div>
            <div className="shrink-0 text-xs text-text-dark">
              {remainingDays !== null
                ? t("schedule_remaining_days", { remaining: remainingDays })
                : t("schedule_total_days", { total: durationDays })}
            </div>
          </div>
          {remainingDays !== null && (
            <div
              aria-label={t("schedule_time_progress")}
              aria-valuemax={durationDays}
              aria-valuemin={0}
              aria-valuenow={elapsedDays ?? 0}
              aria-valuetext={progressDescription}
              className="h-1.5 overflow-hidden rounded-full bg-white"
              role="progressbar"
            >
              <div
                className="h-full rounded-full bg-logo-cyan transition-[width]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
