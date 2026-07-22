"use client";

import {
  exportLighthouseOutcome,
  useLighthouseCohort,
  useLighthouseCohortEnrollments,
  useLighthouseOutcome,
} from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { toast } from "@daodao/ui/components/sonner";
import { Download, Sprout } from "lucide-react";
import { useState } from "react";
import { CohortErrorState } from "./cohort-error-state";

interface CohortOutcomeProps {
  programId: number;
  cohortId: number;
}

export function CohortOutcome({ programId, cohortId }: CohortOutcomeProps) {
  const t = useTranslations("lighthouse");
  const cohort = useLighthouseCohort(programId, cohortId).data?.data;
  const outcomeQuery = useLighthouseOutcome(programId, cohortId);
  const outcome = outcomeQuery.data?.data;
  const enrollments = useLighthouseCohortEnrollments(programId, cohortId).data?.data?.filter(
    (item) => item.status === "joined"
  );
  const [busy, setBusy] = useState(false);
  async function download() {
    setBusy(true);
    const response = await exportLighthouseOutcome(programId, cohortId);
    setBusy(false);
    if (response.error || !response.data) {
      toast.error(t("export_failed"));
      return;
    }
    const blob = new Blob([JSON.stringify(response.data.data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `cohort-${cohortId}-outcome.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(t("export_ready"));
  }
  const rate = Math.round((outcome?.sustainedParticipationRate ?? 0) * 100);
  if (outcomeQuery.isLoading)
    return <p className="px-10 py-12 text-sm text-[#5A7B79]">{t("loading")}</p>;
  if (outcomeQuery.error || outcomeQuery.validationError)
    return (
      <CohortErrorState
        message={t("load_failed")}
        retryLabel={t("retry")}
        onRetry={() => void outcomeQuery.mutate()}
      />
    );
  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10 md:px-10">
      <header>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#0D7773]">
          {t("outcome_eyebrow")}
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
          {cohort?.displayName ?? t("cohort_nav_outcome")}
        </h1>
        <p className="mt-3 text-[#5A7B79]">{t("outcome_description")}</p>
      </header>
      {!outcome ? (
        <div className="mt-10 rounded-3xl border border-dashed border-[#B9DCD8] px-6 py-16 text-center">
          <Sprout className="mx-auto size-9 text-[#0D7773]" />
          <h2 className="mt-4 text-xl font-semibold">{t("outcome_empty")}</h2>
        </div>
      ) : (
        <>
          <section className="mt-8 grid gap-4 sm:grid-cols-3">
            <Metric value={outcome.completedCount} label={t("outcome_completed")} />
            <Metric value={outcome.sustainedParticipationCount} label={t("outcome_sustained")} />
            <Metric value={`${rate}%`} label={t("outcome_flow_rate")} />
          </section>
          <section className="mt-6 rounded-3xl border border-[#CDEBE8] bg-white p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-xl font-semibold">{t("outcome_export_title")}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5A7B79]">
                  {t("outcome_export_description")}
                </p>
              </div>
              <Button
                onClick={download}
                disabled={busy || !enrollments?.some((item) => item.exportOptIn)}
              >
                <Download className="size-4" />
                {t("download_outcome")}
              </Button>
            </div>
            <div className="mt-6 divide-y divide-[#DDEFED] border-y border-[#DDEFED]">
              {enrollments?.map((item) => (
                <label key={item.id} className="flex items-center gap-3 py-3 text-sm">
                  <input
                    type="checkbox"
                    checked={item.exportOptIn}
                    disabled
                    className="size-4 accent-[#0D7773]"
                  />
                  <span className="flex-1">{item.nickname || t("learner")}</span>
                  <span className={item.exportOptIn ? "text-[#0D7773]" : "text-[#78928F]"}>
                    {item.exportOptIn ? t("opted_in") : t("not_opted_in")}
                  </span>
                </label>
              ))}
            </div>
            <p className="mt-4 text-xs text-[#78928F]">{t("export_no_email")}</p>
          </section>
        </>
      )}
    </div>
  );
}

function Metric({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="rounded-3xl border border-[#CDEBE8] bg-[#F0FBF9] p-6">
      <strong className="text-2xl text-[#0D7773]">{value}</strong>
      <p className="mt-2 text-sm text-[#5A7B79]">{label}</p>
    </div>
  );
}
