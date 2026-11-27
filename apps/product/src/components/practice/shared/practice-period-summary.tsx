"use client";

import { useTranslations } from "@daodao/i18n";
import { Progress } from "@daodao/ui/components/progress";
import { format } from "date-fns";
import { CalendarDays } from "lucide-react";
import { parseLocalDate, practiceEndDate, practiceRemainingDays } from "@/utils/practice-period";

interface PracticePeriodSummaryProps {
  startDate?: string | null;
  durationDays: number | null;
}

export function PracticePeriodSummary({
  startDate,
  durationDays,
}: Readonly<PracticePeriodSummaryProps>) {
  const t = useTranslations("practice");
  const start = startDate ? parseLocalDate(startDate) : null;
  if (!start || durationDays === null || !Number.isInteger(durationDays) || durationDays < 1) {
    return null;
  }

  const end = practiceEndDate(start, durationDays);
  const remaining = practiceRemainingDays(start, durationDays, new Date());
  const elapsed = durationDays - remaining;
  const elapsedLabel = t("period_elapsed", { elapsed, total: durationDays });

  return (
    <div className="mb-4 rounded-xl bg-logo-cyan/5 p-3 sm:p-4">
      <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-text-dark">
        <CalendarDays aria-hidden="true" className="size-4 shrink-0 text-logo-cyan" />
        <time dateTime={format(start, "yyyy-MM-dd")}>{format(start, "yyyy/MM/dd")}</time>
        <span aria-hidden="true">–</span>
        <time dateTime={format(end, "yyyy-MM-dd")}>{format(end, "yyyy/MM/dd")}</time>
      </div>
      <div className="mb-2 flex flex-wrap justify-between gap-x-3 gap-y-1 text-sm text-text-dark">
        <span>{elapsedLabel}</span>
        <span>{t("period_remaining", { remaining })}</span>
      </div>
      <Progress
        value={(elapsed / durationDays) * 100}
        aria-label={t("period_progress_label")}
        getValueLabel={() => elapsedLabel}
        className="h-1.5 bg-white [--active-color:var(--logo-cyan)]"
      />
    </div>
  );
}
