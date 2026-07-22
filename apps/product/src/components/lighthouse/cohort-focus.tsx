"use client";

import { useLighthouseCohort, useLighthouseFocus } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { PartyPopper, Sparkles } from "lucide-react";
import { useState } from "react";

interface CohortFocusProps {
  programId: number;
  cohortId: number;
}

export function CohortFocus({ programId, cohortId }: CohortFocusProps) {
  const t = useTranslations("lighthouse");
  const [tab, setTab] = useState<"encouragement" | "celebrations">("encouragement");
  const cohort = useLighthouseCohort(programId, cohortId).data?.data;
  const data = useLighthouseFocus(programId, cohortId).data?.data;
  const items = tab === "encouragement" ? data?.needsEncouragement : data?.celebrations;

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10 md:px-10">
      <header>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#0D7773]">
          {t("focus_eyebrow")}
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
          {cohort?.displayName ?? t("cohort_nav_focus")}
        </h1>
        <p className="mt-3 text-[#5A7B79]">{t("focus_description")}</p>
      </header>
      <div className="mt-8 flex gap-2 rounded-full bg-[#E7FAF7] p-1.5">
        <button
          type="button"
          onClick={() => setTab("encouragement")}
          className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold ${tab === "encouragement" ? "bg-[#0D3036] text-white" : "text-[#456B68]"}`}
        >
          {t("needs_encouragement")} · {data?.needsEncouragement.length ?? 0}
        </button>
        <button
          type="button"
          onClick={() => setTab("celebrations")}
          className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold ${tab === "celebrations" ? "bg-[#0D3036] text-white" : "text-[#456B68]"}`}
        >
          {t("worth_celebrating")} · {data?.celebrations.length ?? 0}
        </button>
      </div>
      <div className="mt-5 grid gap-4">
        {!items?.length && (
          <p className="rounded-3xl border border-dashed border-[#B9DCD8] px-6 py-14 text-center text-sm text-[#5A7B79]">
            {t("focus_empty")}
          </p>
        )}
        {tab === "encouragement" &&
          data?.needsEncouragement.map((item) => (
            <article key={item.userId} className="rounded-3xl border border-[#CDEBE8] bg-white p-6">
              <div className="flex items-start gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#E7FAF7] text-[#0D7773]">
                  <Sparkles className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold">{item.nickname || t("learner")}</h2>
                  <p className="mt-2 text-sm leading-6 text-[#5A7B79]">
                    {item.lastCheckinPreview || t("no_checkin_preview")}
                  </p>
                  <p className="mt-2 text-xs text-[#78928F]">
                    {t("interrupted_days", { count: item.interruptedDays })}
                  </p>
                </div>
                <CustomLink
                  href={`/lighthouse/programs/${programId}/cohorts/${cohortId}/feed`}
                  className="rounded-full bg-[#FFA10B] px-4 py-2 text-sm font-semibold text-[#0D3036]"
                >
                  {t("send_encouragement")}
                </CustomLink>
              </div>
            </article>
          ))}
        {tab === "celebrations" &&
          data?.celebrations.map((item) => (
            <article
              key={`${item.userId}-${item.occurredAt}`}
              className="rounded-3xl border border-[#F3DDBD] bg-[#FFF9EF] p-6"
            >
              <PartyPopper className="size-6 text-[#A95D00]" />
              <h2 className="mt-4 text-lg font-semibold">{item.nickname || t("learner")}</h2>
              <p className="mt-2 text-sm text-[#72593C]">{t(`celebration_${item.moment}`)}</p>
            </article>
          ))}
      </div>
    </div>
  );
}
