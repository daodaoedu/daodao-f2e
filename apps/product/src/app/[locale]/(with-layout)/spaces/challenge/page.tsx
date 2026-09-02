"use client";

import { useTranslations } from "@daodao/i18n";
import { Compass } from "lucide-react";
import { SpacePracticeSection, SpaceSubpageHeader } from "@/components/spaces";

/**
 * 共同挑戰子頁 (FRD 4): the platform-challenge space. Challenge data waits on
 * the group-challenge backend (#138), so the practice list renders empty and
 * the explore banner shows the no-upcoming-challenge tagline (FR-4.1(b)).
 */
export default function ChallengeSpacePage() {
  const t = useTranslations("space");

  return (
    <div className="mx-auto min-h-screen max-w-[640px] px-4 pb-[72px] pt-[68px] md:pt-6">
      <SpaceSubpageHeader title={t("challenge_name")} subtitle={t("challenge_host")} />
      <div className="mb-4 flex items-center gap-3 rounded-2xl border border-[#CDEBE8] bg-[#F0FAF8] px-4 py-3.5">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-primary-base">
          <Compass className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text-dark">{t("explore_challenge_title")}</p>
          {/* TODO(#138): 依未來兩週是否有共同挑戰切換 tagline（explore_challenge_upcoming） */}
          <p className="mt-0.5 text-xs text-text-dark/55">{t("explore_challenge_none")}</p>
        </div>
      </div>
      <SpacePracticeSection tasks={[]} />
    </div>
  );
}
