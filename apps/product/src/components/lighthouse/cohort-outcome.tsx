"use client";

import { type LighthouseOutcome, useLighthouseOutcome } from "@daodao/api";
import { useLocale, useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { cn } from "@daodao/ui/lib/utils";
import { FileText } from "lucide-react";
import { CohortErrorState } from "./cohort-error-state";
import { CohortOutcomeSummary } from "./cohort-outcome-summary";
import { CohortOutcomeTables } from "./cohort-outcome-tables";

interface CohortOutcomeProps {
  programId: number;
  cohortId: number;
}

/** 成果報告檔名（FR-OUT-07）：場次名稱_成果報告_YYYYMMDD */
export function outcomeReportFilename(displayName: string, now = new Date()): string {
  const day = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(now)
    .replace(/-/g, "");
  return `${displayName}_成果報告_${day}`;
}

/**
 * 成果頁（FRD frd-activity-outcome-org.md §3.2）：概況四卡（含進行中／最終標示）、AI 摘要、實踐成果、參與者進度、匯出。
 * PDF 由列印版頁面產生（/outcome/report），此處只負責開新分頁。
 */
export function CohortOutcome({ programId, cohortId }: CohortOutcomeProps) {
  const t = useTranslations("lighthouse");
  const locale = useLocale();
  const query = useLighthouseOutcome(programId, cohortId);
  const outcome = query.data?.data;

  if (query.isLoading && !outcome)
    return <p className="px-10 py-12 text-sm text-[#5A7B79]">{t("loading")}</p>;
  if (query.error || query.validationError || !outcome)
    return (
      <CohortErrorState
        message={t("load_failed")}
        retryLabel={t("retry")}
        onRetry={() => void query.mutate()}
      />
    );

  // 匯出的 audit 由報告頁按「列印／另存 PDF」時才記（避免只開分頁沒匯出也留紀錄、或記兩次）
  function openReport() {
    window.open(
      `/${locale}/lighthouse/programs/${programId}/cohorts/${cohortId}/outcome/report`,
      "_blank",
      "noopener"
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-5 py-8 md:px-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-[#5A7B79]">{t("outcome_description")}</p>
        <PhaseBadge phase={outcome.phase} finalizedAt={outcome.finalizedAt} />
      </div>

      <OutcomeOverview outcome={outcome} />

      <CohortOutcomeSummary
        programId={programId}
        cohortId={cohortId}
        outcome={outcome}
        refresh={() => query.mutate()}
      />

      <CohortOutcomeTables outcome={outcome} />

      <section
        className="rounded-3xl border border-[#CDEBE8] bg-white p-6"
        aria-labelledby="outcome-export-title"
      >
        <h2 id="outcome-export-title" className="text-lg font-semibold tracking-[-0.02em]">
          {t("outcome_export_title")}
        </h2>
        <p className="mt-1 text-[13px] text-[#78928F]">{t("outcome_export_description")}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            type="button"
            className="h-auto min-w-[220px] flex-col items-start gap-0.5 rounded-2xl bg-[#F0FBF9] px-5 py-3 text-left text-[#0D5B59] hover:bg-[#E0F3F0]"
            onClick={openReport}
            data-testid="outcome-export-report"
          >
            <span className="flex items-center gap-2 font-semibold">
              <FileText className="size-4" aria-hidden="true" />
              {t("outcome_export_report")}
            </span>
            <span className="text-xs font-normal text-[#5A7B79]">
              {t("outcome_export_report_hint")}
            </span>
          </Button>
          <Button
            type="button"
            disabled
            aria-disabled="true"
            className="h-auto min-w-[220px] flex-col items-start gap-0.5 rounded-2xl bg-[#F6F9F8] px-5 py-3 text-left text-[#8AA09E] opacity-70"
          >
            <span className="font-semibold">{t("outcome_export_learners")}</span>
            <span className="text-xs font-normal">{t("coming_soon_badge")}</span>
          </Button>
        </div>
      </section>
    </div>
  );
}

export function PhaseBadge({
  phase,
  finalizedAt,
}: {
  phase: LighthouseOutcome["phase"];
  finalizedAt: string | null;
}) {
  const t = useTranslations("lighthouse");
  const label =
    phase === "ended"
      ? finalizedAt
        ? t("outcome_phase_final")
        : t("outcome_phase_ended")
      : phase === "not_started"
        ? t("outcome_phase_not_started")
        : t("outcome_phase_in_progress");
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold",
        phase === "ended" ? "bg-[#E7FAF7] text-[#0D5B59]" : "bg-[#FFF4D6] text-[#7A6120]"
      )}
      data-testid="outcome-phase"
    >
      {label}
    </span>
  );
}

export function OutcomeOverview({ outcome }: { outcome: LighthouseOutcome }) {
  const t = useTranslations("lighthouse");
  const cards = [
    {
      key: "participants",
      value: outcome.overview.participants,
      label: t("outcome_stat_participants"),
    },
    {
      key: "activated",
      value: outcome.overview.activatedPractices,
      label: t("outcome_stat_activated"),
    },
    { key: "checkins", value: outcome.overview.checkins, label: t("outcome_stat_checkins") },
    {
      key: "comments",
      value: outcome.overview.comments,
      label: t("outcome_stat_comments"),
      amber: true,
    },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4" data-testid="outcome-overview">
      {cards.map((card) => (
        <div
          key={card.key}
          className={cn(
            "rounded-[18px] border p-4",
            card.amber ? "border-[#F0D9B7] bg-[#FFFCF7]" : "border-[#CDEBE8] bg-white"
          )}
        >
          <p
            className={cn(
              "text-[22px] font-bold",
              card.amber ? "text-[#A95D00]" : "text-[#0D7773]"
            )}
          >
            {card.value}
          </p>
          <p className={cn("mt-1 text-xs", card.amber ? "text-[#9A7B52]" : "text-[#78928F]")}>
            {card.label}
          </p>
        </div>
      ))}
    </div>
  );
}
