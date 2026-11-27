"use client";

import { type MyChallengeType, useChallenges, useMyChallenges } from "@daodao/api";
import { useAuth } from "@daodao/auth";
import { useTranslations } from "@daodao/i18n";
import { Link, useRouter } from "@daodao/i18n/navigation";
import { FilterMenu, FilterMenuItem } from "@daodao/ui/components/filter-menu";
import { Spinner } from "@daodao/ui/components/spinner";
import { addDays, isAfter, parseISO } from "date-fns";
import { ChevronRight, Flag } from "lucide-react";
import { useMemo, useState } from "react";
import { ChallengeCard, InspirationDrawDialog } from "@/components/challenge";
import { ExploreEmpty } from "@/components/explore/explore-empty";
import { ExploreSectionHeader } from "@/components/explore/explore-section";
import { SpacePageShell } from "@/components/spaces";
import { needsSeparatePracticeLink } from "@/utils/challenge-card";
import { resolveMyChallengesView } from "@/utils/my-challenges-view";

type FilterKey = "all" | "ongoing" | "upcoming" | "ended";

const FILTER_OPTIONS: FilterKey[] = ["all", "ongoing", "upcoming", "ended"];
const UPCOMING_WINDOW_DAYS = 14;

export default function ChallengeSpacePage() {
  const t = useTranslations("space");
  const tChallenge = useTranslations("challenge");
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading, login } = useAuth();
  // 確認已登入才查：未登入時此端點必回 401（daodao#295）
  const { data: mineData, isLoading, error } = useMyChallenges(!isAuthLoading && isAuthenticated);
  const { data: exploreData } = useChallenges();
  const [filter, setFilter] = useState<FilterKey>("ongoing");
  const [drawTarget, setDrawTarget] = useState<number | null>(null);

  const mine = useMemo(() => mineData?.data ?? [], [mineData]);
  const filtered = useMemo(
    () => (filter === "all" ? mine : mine.filter((c) => c.runStatus === filter)),
    [mine, filter]
  );
  const view = resolveMyChallengesView({
    isAuthLoading,
    isAuthenticated,
    isLoading,
    hasError: Boolean(error),
    hasData: Boolean(mineData),
  });
  const hasUpcoming = useMemo(() => {
    const limit = addDays(new Date(), UPCOMING_WINDOW_DAYS);
    return (exploreData?.data ?? []).some(
      (c) => c.runStatus === "upcoming" && !isAfter(parseISO(c.startDate), limit)
    );
  }, [exploreData]);

  const triggerLabel = tChallenge(`filter_${filter}`);
  const content =
    view === "loading" ? (
      <div className="flex justify-center py-16">
        <Spinner aria-label={t("loading")} />
      </div>
    ) : view === "login-required" ? (
      <ExploreEmpty
        title={t("challenge_login_required")}
        action={
          <button
            type="button"
            onClick={() => login("/spaces/challenge")}
            className="rounded-full bg-primary-base px-6 py-2.5 text-sm font-medium text-white"
          >
            {t("challenge_login_action")}
          </button>
        }
      />
    ) : view === "error" ? (
      <ExploreEmpty role="alert" title={t("challenge_load_error")} />
    ) : filtered.length === 0 ? (
      <ExploreEmpty
        title={mine.length === 0 ? t("challenge_empty") : t("challenge_filter_empty")}
      />
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
    );

  return (
    <SpacePageShell kind="challenge" title={t("challenge_name")} subtitle={t("challenge_host")}>
      <div className="flex items-center gap-2">
        <FilterMenu
          label={triggerLabel}
          active={filter !== "all"}
          triggerAriaLabel={t("filter_trigger_aria_label", { label: triggerLabel })}
          menuAriaLabel={t("challenge_filter_menu_aria_label")}
        >
          {FILTER_OPTIONS.map((key) => (
            <FilterMenuItem
              key={key}
              label={tChallenge(`filter_${key}`)}
              checked={filter === key}
              onToggle={() => setFilter(key)}
            />
          ))}
        </FilterMenu>
      </div>

      {/* FR-4.1(b)：篩選器下方顯示探索共同挑戰入口；配色比照首頁探索入口（旗子＋橘色呼吸點） */}
      <Link
        href="/challenges"
        className="flex items-center gap-3 rounded-[20px] border border-[#E4EAE9] bg-white px-4 py-3.5 transition-all duration-160 hover:-translate-y-[3px] hover:border-logo-cyan/50 hover:shadow-[0_12px_26px_rgba(15,48,54,0.09)]"
      >
        <span className="grid size-8 shrink-0 place-items-center rounded-[10px] bg-logo-orange/12">
          <Flag className="size-4 text-logo-orange" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5 text-[15px] font-semibold text-bg-dark">
            {t("explore_challenge_title")}
            {hasUpcoming && (
              <span className="relative inline-flex size-[6px]" aria-hidden="true">
                <span className="absolute inset-0 rounded-full bg-logo-orange animate-breathe-amber" />
                <span className="absolute inset-px rounded-full bg-logo-orange" />
              </span>
            )}
          </span>
          <span className="mt-0.5 block text-[13px] text-text-dark/70">
            {hasUpcoming ? t("explore_challenge_upcoming") : t("explore_challenge_none")}
          </span>
        </span>
        <ChevronRight className="size-[18px] shrink-0 text-text-dark/30" aria-hidden="true" />
      </Link>

      <section>
        <div className="mb-5">
          <ExploreSectionHeader
            title={t("challenge_section_title")}
            count={filtered.length}
            Icon={Flag}
          />
        </div>
        {content}
      </section>

      <InspirationDrawDialog
        challengeId={drawTarget}
        onOpenChange={(open) => {
          if (!open) setDrawTarget(null);
        }}
      />
    </SpacePageShell>
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
        practiceId={challenge.practiceId}
      />
      {needsSeparatePracticeLink(challenge, challenge.practiceId) && (
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
