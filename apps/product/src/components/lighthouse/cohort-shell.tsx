"use client";

import { useTranslations } from "@daodao/i18n";
import { usePathname } from "@daodao/i18n/navigation";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { cn } from "@daodao/ui/lib/utils";

interface CohortShellProps {
  programId: number;
  cohortId: number;
  children: React.ReactNode;
}

const sections = ["dashboard", "roster", "focus", "feed", "outcome"] as const;

export function CohortShell({ programId, cohortId, children }: CohortShellProps) {
  const t = useTranslations("lighthouse");
  const pathname = usePathname();
  const base = `/lighthouse/programs/${programId}/cohorts/${cohortId}`;

  return (
    <div>
      <div className="border-b border-[#CDEBE8] bg-white px-5 md:px-10">
        <nav
          className="mx-auto flex max-w-6xl gap-1 overflow-x-auto py-3"
          aria-label={t("cohort_navigation")}
        >
          {sections.map((section) => {
            const href = `${base}/${section}`;
            return (
              <CustomLink
                key={section}
                href={href}
                className={cn(
                  "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium",
                  pathname.startsWith(href)
                    ? "bg-[#0D3036] text-white"
                    : "text-[#456B68] hover:bg-[#EDF8F6]"
                )}
              >
                {t(`cohort_nav_${section}`)}
              </CustomLink>
            );
          })}
        </nav>
      </div>
      {children}
    </div>
  );
}
