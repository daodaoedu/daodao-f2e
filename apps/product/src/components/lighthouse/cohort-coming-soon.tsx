"use client";

import { useTranslations } from "@daodao/i18n";

interface CohortComingSoonProps {
  section: "feed" | "outcome";
}

/** FR-CT-01：「動態」「成果」為未開放頁籤，點擊後顯示占位文字 */
export function CohortComingSoon({ section }: CohortComingSoonProps) {
  const t = useTranslations("lighthouse");
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 md:px-10">
      <div className="rounded-3xl border border-dashed border-[#B9DCD8] bg-white/60 px-6 py-16 text-center">
        <p className="text-base text-[#456B68]">
          {t("coming_soon", { section: t(`cohort_nav_${section}`) })}
        </p>
      </div>
    </div>
  );
}
