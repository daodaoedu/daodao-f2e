"use client";

import { recordLighthouseOutcomeExport, useLighthouseOutcome } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { Printer } from "lucide-react";
import { useEffect } from "react";
import { CohortErrorState } from "./cohort-error-state";
import { OutcomeOverview, outcomeReportFilename, PhaseBadge } from "./cohort-outcome";
import { CohortOutcomeTables } from "./cohort-outcome-tables";

interface CohortOutcomeReportProps {
  programId: number;
  cohortId: number;
}

/**
 * 成果報告列印版（FR-OUT-07）：同一份成果資料排成 A4 友善版面，
 * document.title 設為「場次名稱_成果報告_YYYYMMDD」讓瀏覽器「另存 PDF」時直接帶入檔名；
 * 列印時隱藏側欄、場次頁籤與操作鈕。
 */
export function CohortOutcomeReport({ programId, cohortId }: CohortOutcomeReportProps) {
  const t = useTranslations("lighthouse");
  const query = useLighthouseOutcome(programId, cohortId);
  const outcome = query.data?.data;
  const filename = outcome ? outcomeReportFilename(outcome.cohort.displayName) : null;

  useEffect(() => {
    if (!filename) return;
    const previous = document.title;
    document.title = filename;
    return () => {
      document.title = previous;
    };
  }, [filename]);

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

  function print() {
    void recordLighthouseOutcomeExport(programId, cohortId, `${filename}.pdf`);
    window.print();
  }

  const current = outcome.summary.current;
  const generatedAt = new Date(outcome.generatedAt).toLocaleString("zh-TW", { hour12: false });

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-8 md:px-10" data-testid="outcome-report">
      <style>{`
        @media print {
          aside, header, nav, [data-report-actions] { display: none !important; }
          main { padding: 0 !important; }
          body { background: #fff !important; }
          [data-testid="outcome-report"] { max-width: none; padding: 0; }
          section, .rounded-3xl { break-inside: avoid; }
        }
      `}</style>
      <div
        className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#CDEBE8] bg-[#F7FCFB] px-4 py-3"
        data-report-actions
      >
        <p className="text-sm text-[#456B68]">
          {t("outcome_report_print_hint", { filename: `${filename}.pdf` })}
        </p>
        <Button
          type="button"
          className="rounded-full"
          onClick={print}
          data-testid="outcome-report-print"
        >
          <Printer className="size-4" aria-hidden="true" />
          {t("outcome_report_print")}
        </Button>
      </div>

      <header className="border-b border-[#CDEBE8] pb-5">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#0D7773]">
          {t("outcome_report_eyebrow")}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
          {outcome.cohort.displayName}
        </h1>
        <p className="mt-1 text-sm text-[#5A7B79]">
          {outcome.cohort.programName} · {outcome.cohort.startDate.slice(0, 10)} —{" "}
          {outcome.cohort.endDate.slice(0, 10)}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <PhaseBadge phase={outcome.phase} finalizedAt={outcome.finalizedAt} />
          <span className="text-xs text-[#78928F]">
            {t("outcome_report_generated_at", { time: generatedAt })}
          </span>
        </div>
      </header>

      <section className="mt-6" aria-labelledby="report-overview-title">
        <h2 id="report-overview-title" className="text-lg font-semibold">
          {t("outcome_report_section_overview")}
        </h2>
        <div className="mt-3">
          <OutcomeOverview outcome={outcome} />
        </div>
      </section>

      <section className="mt-6" aria-labelledby="report-summary-title">
        <h2 id="report-summary-title" className="text-lg font-semibold">
          {t("outcome_summary_title")}
        </h2>
        {current ? (
          <div className="mt-3 rounded-2xl border border-[#DDEFED] bg-[#F7FCFB] p-5">
            <p className="whitespace-pre-wrap text-sm leading-[1.8] text-[#0D3036]">
              {current.content}
            </p>
            <p className="mt-3 text-xs text-[#78928F]">
              {current.source === "manual"
                ? t("outcome_report_summary_manual", {
                    name: current.createdBy?.nickname ?? t("coach"),
                  })
                : t("outcome_report_summary_ai", {
                    source:
                      current.source === "own_ai"
                        ? t("outcome_ai_mode_own")
                        : t("outcome_ai_mode_platform"),
                  })}
            </p>
          </div>
        ) : (
          <p className="mt-3 text-sm text-[#78928F]">{t("outcome_summary_placeholder")}</p>
        )}
      </section>

      <section className="mt-6">
        <CohortOutcomeTables outcome={outcome} plain />
      </section>
    </div>
  );
}
