"use client";

import { useLighthouseCohort } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { usePathname } from "@daodao/i18n/navigation";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { cn } from "@daodao/ui/lib/utils";
import { ChevronLeft, Pencil } from "lucide-react";

interface CohortShellProps {
  programId: number;
  cohortId: number;
  children: React.ReactNode;
}

/** FR-CT-01：儀表板、名單、今日焦點為本版功能；動態、成果保留頁籤但顯示「還在規劃中」 */
const sections = ["dashboard", "roster", "focus", "feed", "outcome"] as const;

export function CohortShell({ programId, cohortId, children }: CohortShellProps) {
  const t = useTranslations("lighthouse");
  const pathname = usePathname();
  const base = `/lighthouse/programs/${programId}/cohorts/${cohortId}`;
  const cohort = useLighthouseCohort(programId, cohortId);
  const cohortName = cohort.data?.data.displayName;
  const isArchived = cohort.data?.data.status === "archived";

  return (
    <div>
      <div className="sticky top-0 z-30 border-b border-[#CDEBE8] bg-white px-5 md:px-10">
        <nav
          className="mx-auto flex max-w-6xl gap-1 overflow-x-auto py-3"
          aria-label={t("cohort_navigation")}
        >
          {sections.map((section) => {
            const href = `${base}/${section}`;
            const isActive = pathname.startsWith(href);
            return (
              <CustomLink
                key={section}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-logo-cyan",
                  isActive ? "bg-[#0D3036] text-white" : "text-[#456B68] hover:bg-[#EDF8F6]"
                )}
              >
                {t(`cohort_nav_${section}`)}
              </CustomLink>
            );
          })}
        </nav>
      </div>

      <header className="mx-auto w-full max-w-6xl px-5 pt-8 md:px-10">
        <CustomLink
          href="/lighthouse/programs"
          className="inline-flex items-center gap-1 rounded-full border border-[#CDEBE8] bg-white px-3 py-1.5 text-xs font-medium text-[#345E5B] hover:bg-[#EDF8F6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-logo-cyan"
        >
          <ChevronLeft className="size-3.5" aria-hidden="true" />
          {t("cohort_back_to_programs")}
        </CustomLink>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-[-0.04em] md:text-3xl">
            {cohortName ?? (cohort.isLoading ? t("loading") : t("cohorts_title"))}
          </h1>
          {!isArchived && (
            <CustomLink
              href={`/lighthouse/programs?edit=${cohortId}#cohort-${cohortId}`}
              aria-label={t("cohort_edit")}
              title={t("cohort_edit")}
              className="grid size-8 place-items-center rounded-full border border-[#CDEBE8] bg-white text-[#0D7773] hover:bg-[#EDF8F6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-logo-cyan"
            >
              <Pencil className="size-3.5" aria-hidden="true" />
            </CustomLink>
          )}
        </div>
      </header>

      {children}
    </div>
  );
}
