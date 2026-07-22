"use client";

import {
  useLighthouseCoachFeed,
  useLighthouseCohorts,
  useLighthouseFocus,
  useLighthouseOrganizations,
  useLighthousePrograms,
} from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { ArrowUpRight, RadioTower } from "lucide-react";

interface CohortPulseProps {
  programId: number;
  cohort: {
    id: number;
    displayName: string;
    status: "draft" | "published" | "archived";
    startDate: string;
    endDate: string;
  };
}

function CohortPulse({ programId, cohort }: CohortPulseProps) {
  const t = useTranslations("lighthouse");
  const focus = useLighthouseFocus(programId, cohort.id);
  const feed = useLighthouseCoachFeed(programId, cohort.id);
  const encouragementCount = focus.data?.data.needsEncouragement.length ?? 0;
  const responseCount = feed.data?.data.pendingResponseCount ?? 0;

  return (
    <CustomLink
      href={`/lighthouse/programs/${programId}/cohorts/${cohort.id}/dashboard`}
      className="group rounded-3xl border border-[#CDEBE8] bg-white p-6 transition-transform hover:-translate-y-1"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#0D7773]">
            {t(`cohort_status_${cohort.status}`)}
          </p>
          <h2 className="mt-2 text-xl font-semibold">{cohort.displayName}</h2>
        </div>
        <ArrowUpRight className="size-5 text-[#0D7773] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
      <p className="mt-2 text-xs text-[#78928F]">
        {cohort.startDate.slice(0, 10)} — {cohort.endDate.slice(0, 10)}
      </p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-[#F0FBF9] p-4">
          <strong className="text-lg text-[#0D7773]">{responseCount}</strong>
          <p className="mt-1 text-xs text-[#5A7B79]">{t("overview_checkins_to_respond")}</p>
        </div>
        <div className="rounded-2xl bg-[#FFF6E8] p-4">
          <strong className="text-lg text-[#A95D00]">{encouragementCount}</strong>
          <p className="mt-1 text-xs text-[#72593C]">{t("overview_people_to_encourage")}</p>
        </div>
      </div>
    </CustomLink>
  );
}

function ProgramCohorts({ programId }: { programId: number }) {
  const { cohorts } = useLighthouseCohorts(programId);
  return cohorts?.filter((cohort) => cohort.status === "published").map((cohort) => (
    <CohortPulse key={cohort.id} programId={programId} cohort={cohort} />
  ));
}

export function LighthouseOverview() {
  const t = useTranslations("lighthouse");
  const { organizations } = useLighthouseOrganizations();
  const { programs, isLoading } = useLighthousePrograms(organizations?.[0]?.id);

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 md:px-10 md:py-14">
      <header className="max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#0D7773]">
          {t("overview_eyebrow")}
        </p>
        <h1 className="mt-4 text-2xl font-semibold leading-[1.08] tracking-[-0.045em] md:text-4xl">
          {t("overview_title")}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-[#456B68] md:text-lg">
          {t("overview_description")}
        </p>
      </header>
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{t("overview_active_cohorts")}</h2>
          <CustomLink href="/lighthouse/programs" className="text-sm font-semibold text-[#0D7773]">
            {t("nav_programs")}
          </CustomLink>
        </div>
        {isLoading && <p className="mt-6 text-sm text-[#5A7B79]">{t("loading")}</p>}
        {!isLoading && !programs?.length && (
          <div className="mt-6 rounded-3xl border border-dashed border-[#B9DCD8] px-6 py-14 text-center">
            <RadioTower className="mx-auto size-8 text-[#0D7773]" />
            <p className="mt-4 font-semibold">{t("programs_empty_title")}</p>
          </div>
        )}
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {programs?.map((program) => (
            <ProgramCohorts key={program.id} programId={program.id} />
          ))}
        </div>
      </section>
    </div>
  );
}
