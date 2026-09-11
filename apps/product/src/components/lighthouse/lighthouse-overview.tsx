"use client";

import {
  type LighthouseOrganizationCohortType,
  useLighthouseOrganizationCohorts,
  useLighthouseOrganizations,
} from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { ArrowUpRight, Pencil, RadioTower } from "lucide-react";

const STATUS_STYLES: Record<LighthouseOrganizationCohortType["status"], string> = {
  published: "text-[#0D7773]",
  draft: "text-[#5A7B79]",
  archived: "text-[#C03A3A]",
};

function CohortCard({ cohort }: { cohort: LighthouseOrganizationCohortType }) {
  const t = useTranslations("lighthouse");
  const manageHref = `/lighthouse/programs/${cohort.programId}/cohorts/${cohort.id}/dashboard`;
  const editHref = `/lighthouse/programs?edit=${cohort.id}#cohort-${cohort.id}`;

  return (
    <article
      className="group relative rounded-3xl border border-[#CDEBE8] bg-white p-6 transition-transform hover:-translate-y-0.5 focus-within:-translate-y-0.5"
      aria-labelledby={`cohort-card-${cohort.id}-title`}
    >
      <CustomLink
        href={manageHref}
        className="absolute inset-0 rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-logo-cyan"
        aria-label={`${t("manage_cohort")}：${cohort.displayName}`}
      >
        <span className="sr-only">{t("manage_cohort")}</span>
      </CustomLink>

      <div className="pointer-events-none relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className={`text-xs font-medium ${STATUS_STYLES[cohort.status]}`}>
            {t(`cohort_status_${cohort.status}`)}
          </span>
          <div className="mt-2 flex items-center gap-2">
            <h2
              id={`cohort-card-${cohort.id}-title`}
              className="truncate text-xl font-semibold tracking-[-0.02em]"
            >
              {cohort.displayName}
            </h2>
            {cohort.status !== "archived" && (
              <Button
                asChild
                variant="outline"
                size="icon"
                className="pointer-events-auto relative z-10 size-7 rounded-full border-[#CDEBE8] text-[#0D7773]"
              >
                <CustomLink href={editHref} aria-label={t("cohort_edit")} title={t("cohort_edit")}>
                  <Pencil className="size-3.5" aria-hidden="true" />
                </CustomLink>
              </Button>
            )}
          </div>
          <p className="mt-1 text-xs text-[#78928F]">
            {cohort.startDate.slice(0, 10)} — {cohort.endDate.slice(0, 10)}
          </p>
        </div>
        <CustomLink
          href={manageHref}
          className="pointer-events-auto relative z-10 grid size-8 place-items-center rounded-full text-[#0D7773] hover:bg-[#EDF8F6]"
          aria-label={t("manage_cohort")}
          title={t("manage_cohort")}
        >
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </CustomLink>
      </div>

      <div className="pointer-events-none relative mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-[#EDF8F6] p-4">
          <span className="text-2xl font-semibold text-[#0D7773]">{cohort.celebrateCount}</span>
          <span className="mt-1 block text-xs text-[#456B68]">{t("overview_stat_celebrate")}</span>
        </div>
        <div className="rounded-xl bg-[#FFF4E5] p-4">
          <span className="text-2xl font-semibold text-[#A95D00]">{cohort.encourageCount}</span>
          <span className="mt-1 block text-xs text-[#456B68]">{t("overview_stat_encourage")}</span>
        </div>
      </div>
    </article>
  );
}

export function LighthouseOverview() {
  const t = useTranslations("lighthouse");
  const { organizations } = useLighthouseOrganizations();
  const organizationId = organizations?.[0]?.id;
  const { cohorts: allCohorts, isLoading } = useLighthouseOrganizationCohorts(organizationId);
  // 封存中的場次改由「封存」頁列出（FR-ARC-04 主要列表需排除封存項目）
  const cohorts = allCohorts?.filter((cohort) => cohort.status !== "archived");

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 md:px-10 md:py-14">
      <header>
        <h1 className="text-2xl font-semibold leading-[1.08] tracking-[-0.045em] md:text-4xl">
          {t("overview_title")}
        </h1>
        <div className="mt-3 text-right">
          <CustomLink
            href="/lighthouse/programs"
            className="text-sm font-semibold text-[#0D7773] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-logo-cyan"
          >
            {t("nav_programs")}
          </CustomLink>
        </div>
      </header>
      {isLoading && <p className="mt-6 text-sm text-[#5A7B79]">{t("loading")}</p>}
      {!isLoading && !cohorts?.length && (
        <div className="mt-6 rounded-3xl border border-dashed border-[#B9DCD8] px-6 py-14 text-center">
          <RadioTower className="mx-auto size-8 text-[#0D7773]" aria-hidden="true" />
          <p className="mt-4 font-semibold">{t("overview_empty")}</p>
        </div>
      )}
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {cohorts?.map((cohort) => (
          <CohortCard key={cohort.id} cohort={cohort} />
        ))}
      </div>
    </div>
  );
}
