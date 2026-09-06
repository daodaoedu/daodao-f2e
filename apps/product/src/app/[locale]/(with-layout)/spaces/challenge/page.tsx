"use client";

import { type MyChallengeType, useChallenges, useMyChallenges } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { Link, useRouter } from "@daodao/i18n/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@daodao/ui/components/dropdown-menu";
import { Spinner } from "@daodao/ui/components/spinner";
import { addDays, isAfter, parseISO } from "date-fns";
import { ChevronDown, ChevronRight, Flag } from "lucide-react";
import { useMemo, useState } from "react";
import { ChallengeCard, InspirationDrawDialog } from "@/components/challenge";
import { SpaceSubpageHeader } from "@/components/spaces";

type FilterKey = "all" | "ongoing" | "upcoming" | "ended";

const FILTER_OPTIONS: FilterKey[] = ["all", "ongoing", "upcoming", "ended"];
const UPCOMING_WINDOW_DAYS = 14;

export default function ChallengeSpacePage() {
  const t = useTranslations("space");
  const router = useRouter();
  const { data: mineData, isLoading } = useMyChallenges();
  const { data: exploreData } = useChallenges();
  const [filter, setFilter] = useState<FilterKey>("ongoing");
  const [drawTarget, setDrawTarget] = useState<number | null>(null);

  const mine = useMemo(() => mineData?.data ?? [], [mineData]);
  const filtered = useMemo(
    () => (filter === "all" ? mine : mine.filter((c) => c.runStatus === filter)),
    [mine, filter]
  );
  const hasUpcoming = useMemo(() => {
    const limit = addDays(new Date(), UPCOMING_WINDOW_DAYS);
    return (exploreData?.data ?? []).some(
      (c) => c.runStatus === "upcoming" && !isAfter(parseISO(c.startDate), limit)
    );
  }, [exploreData]);

  return (
    <div className="mx-auto min-h-screen max-w-[640px] px-4 pb-[72px] pt-[68px] md:pt-6">
      <SpaceSubpageHeader title={t("challenge_name")} variant="banner" />
      <Link
        href="/challenges"
        className="mb-4 flex items-center gap-3 rounded-[14px] border border-[#F5E6B8] bg-[#FDF8EC] px-4 py-3.5 transition-colors hover:border-[#E8D49A]"
      >
        <span className="grid size-8 shrink-0 place-items-center rounded-[10px] border border-[#F5E6B8] bg-white">
          <Flag className="size-4 text-[#D4A843]" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold text-text-dark">
            {t("explore_challenge_title")}
          </span>
          <span className="mt-0.5 block text-[13px] text-text-dark/55">
            {hasUpcoming ? t("explore_challenge_upcoming") : t("explore_challenge_none")}
          </span>
        </span>
        <ChevronRight className="size-[18px] shrink-0 text-[#D4A843]" />
      </Link>

      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-dark">{t("challenge_section_title")}</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-primary-base bg-primary-base px-3 py-1 text-sm text-white"
            >
              {t(`challenge_filter_${filter}`)}
              <ChevronDown className="size-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-28">
            {FILTER_OPTIONS.map((key) => (
              <DropdownMenuItem
                key={key}
                onClick={() => setFilter(key)}
                className={filter === key ? "font-semibold text-primary-base" : ""}
              >
                {t(`challenge_filter_${key}`)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner aria-label={t("loading")} />
        </div>
      ) : filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[#DCEBEA] px-4 py-10 text-center text-sm text-text-dark/60">
          {mine.length === 0 ? t("challenge_empty") : t("challenge_filter_empty")}
        </p>
      ) : (
        <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2">
          {filtered.map((challenge) => (
            <MyChallengeItem
              key={challenge.id}
              challenge={challenge}
              onJoinClick={() => router.push("/challenges")}
              onDrawClick={(id) => setDrawTarget(id)}
              openLabel={t("challenge_open_practice")}
            />
          ))}
        </ul>
      )}

      <InspirationDrawDialog
        challengeId={drawTarget}
        onOpenChange={(open) => {
          if (!open) setDrawTarget(null);
        }}
      />
    </div>
  );
}

function MyChallengeItem({
  challenge,
  onJoinClick,
  onDrawClick,
  openLabel,
}: {
  challenge: MyChallengeType;
  onJoinClick: () => void;
  onDrawClick: (id: number) => void;
  openLabel: string;
}) {
  return (
    <li className="flex flex-col gap-2">
      <ChallengeCard
        challenge={challenge}
        onJoinClick={onJoinClick}
        onDrawClick={() => onDrawClick(challenge.id)}
      />
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
