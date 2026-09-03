"use client";

import { type MyChallengeType, useChallenges, useMyChallenges } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { Link, useRouter } from "@daodao/i18n/navigation";
import { Spinner } from "@daodao/ui/components/spinner";
import { addDays, isAfter, parseISO } from "date-fns";
import { ChevronRight, Compass } from "lucide-react";
import { useMemo } from "react";
import { ChallengeCard } from "@/components/challenge";
import { SpaceSubpageHeader } from "@/components/spaces";

const UPCOMING_WINDOW_DAYS = 14;

/**
 * 共同挑戰子頁 (FRD 4 / daodao #174)：列出我參加的挑戰（含已結束），
 * 每張卡可打開加入時自動複製的實踐；探索 banner 依未來兩週是否有新挑戰切換 tagline。
 */
export default function ChallengeSpacePage() {
  const t = useTranslations("space");
  const router = useRouter();
  const { data: mineData, isLoading } = useMyChallenges();
  const { data: exploreData } = useChallenges();

  const mine = useMemo(() => mineData?.data ?? [], [mineData]);
  const hasUpcoming = useMemo(() => {
    const limit = addDays(new Date(), UPCOMING_WINDOW_DAYS);
    return (exploreData?.data ?? []).some(
      (challenge) =>
        challenge.runStatus === "upcoming" && !isAfter(parseISO(challenge.startDate), limit)
    );
  }, [exploreData]);

  return (
    <div className="mx-auto min-h-screen max-w-[640px] px-4 pb-[72px] pt-[68px] md:pt-6">
      <SpaceSubpageHeader title={t("challenge_name")} subtitle={t("challenge_host")} />
      <Link
        href="/challenges"
        className="mb-4 flex items-center gap-3 rounded-2xl border border-[#CDEBE8] bg-[#F0FAF8] px-4 py-3.5 transition-colors hover:border-primary-base/55"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-primary-base">
          <Compass className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-text-dark">
            {t("explore_challenge_title")}
          </span>
          <span className="mt-0.5 block text-xs text-text-dark/55">
            {hasUpcoming ? t("explore_challenge_upcoming") : t("explore_challenge_none")}
          </span>
        </span>
        <ChevronRight className="size-[18px] shrink-0 text-text-dark/40" />
      </Link>

      <h3 className="mb-3 text-sm font-semibold text-text-dark">{t("challenge_section_title")}</h3>
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner aria-label={t("loading")} />
        </div>
      ) : mine.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[#DCEBEA] px-4 py-10 text-center text-sm text-text-dark/60">
          {t("challenge_empty")}
        </p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-4 p-0">
          {mine.map((challenge) => (
            <MyChallengeItem
              key={challenge.id}
              challenge={challenge}
              onJoinClick={() => router.push("/challenges")}
              openLabel={t("challenge_open_practice")}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function MyChallengeItem({
  challenge,
  onJoinClick,
  openLabel,
}: {
  challenge: MyChallengeType;
  onJoinClick: () => void;
  openLabel: string;
}) {
  return (
    <li className="flex flex-col gap-2">
      <ChallengeCard challenge={challenge} onJoinClick={onJoinClick} />
      {challenge.practiceId && (
        <Link
          href={`/practices/${challenge.practiceId}`}
          className="inline-flex items-center gap-1 self-end text-[13px] font-semibold text-primary-base"
        >
          {openLabel}
          <ChevronRight className="size-3.5" />
        </Link>
      )}
    </li>
  );
}
