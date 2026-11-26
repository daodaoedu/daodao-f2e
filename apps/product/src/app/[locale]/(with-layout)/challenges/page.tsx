"use client";

import {
  type ChallengeSummaryType,
  useChallenges,
  useCurrentUser,
  useMyChallenges,
} from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { usePathname, useRouter } from "@daodao/i18n/navigation";
import { FilterMenu, FilterMenuItem } from "@daodao/ui/components/filter-menu";
import { Spinner } from "@daodao/ui/components/spinner";
import { useEffect, useMemo, useState } from "react";
import { ChallengeCard, InspirationDrawDialog, JoinChallengeDialog } from "@/components/challenge";
import { ExploreEmpty } from "@/components/explore/explore-empty";
import { ExplorePageShell } from "@/components/explore/explore-page-shell";
import { ExploreSection } from "@/components/explore/explore-section";
import { ExploreToolbar } from "@/components/explore/explore-toolbar";
import { groupByRunStatus, type RunStatus } from "@/components/explore/group-by-run-status";
import { RUN_STATUS_SECTION } from "@/components/explore/section-icons";
import {
  CHALLENGE_STATUS_FILTERS,
  type ChallengeStatusFilter,
  searchChallenges,
} from "@/constants/challenge-filter";
import { buildPracticeIdMap, pruneJustJoined } from "@/utils/challenge-card";
import { getExploreChallengeCardHref } from "@/utils/challenge-detail";

/**
 * 探索共同挑戰 standalone 頁（openspec: challenge-discovery）
 *
 * 公開頁：未登入可瀏覽；點「現在加入」才要求登入。
 * 依運行狀態分三區：即將開始／進行中／已結束（版面依 POC 探索共同挑戰-standalone）。
 * 放在 (with-layout) 下，與其他頁共用側邊導覽（POC 左側 nav，daodao#181）。
 * 外框、搜尋篩選、分區與探索活動課程共用（daodao#567）。
 * 每張卡都連到挑戰介紹頁（daodao#570）。
 */
/** 分區副標：進行中沒有副標 */
const SECTION_SUBTITLE_KEY: Record<
  RunStatus,
  "section_upcoming_subtitle" | "section_ended_subtitle" | null
> = {
  upcoming: "section_upcoming_subtitle",
  ongoing: null,
  ended: "section_ended_subtitle",
};

export default function ChallengesPage() {
  const t = useTranslations("challenge");
  const router = useRouter();
  const pathname = usePathname();
  const { data: currentUser } = useCurrentUser();
  const { data, isLoading, mutate } = useChallenges();
  // 探索列表不含自動複製的實踐 id；登入時從「我參加的挑戰」補上，讓已加入的卡片能點進實踐頁打卡
  const { data: mineData, mutate: mutateMine } = useMyChallenges(Boolean(currentUser));
  const [joinTarget, setJoinTarget] = useState<ChallengeSummaryType | null>(null);
  const [drawTarget, setDrawTarget] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ChallengeStatusFilter>("all");
  // 剛加入的挑戰：先用 join API 回傳的 practiceId，避免「已加入但 /me/challenges 尚未更新」時卡片沒有連結
  const [justJoinedPracticeIds, setJustJoinedPracticeIds] = useState<Record<number, string | null>>(
    {}
  );

  const challenges = useMemo(() => data?.data ?? [], [data]);
  const practiceIdByChallenge = useMemo(
    () => buildPracticeIdMap(mineData?.data ?? [], justJoinedPracticeIds),
    [mineData, justJoinedPracticeIds]
  );
  // /me/challenges 已有該挑戰項目後，丟掉保留的 join 回傳值，以列表（含明確的 null）為準
  useEffect(() => {
    if (!mineData) return;
    setJustJoinedPracticeIds((prev) => pruneJustJoined(prev, mineData.data));
  }, [mineData]);
  const filtered = useMemo(
    () => searchChallenges(challenges, searchQuery, statusFilter),
    [challenges, searchQuery, statusFilter]
  );
  const sections = useMemo(() => groupByRunStatus(filtered), [filtered]);

  const handleJoinClick = (challenge: ChallengeSummaryType) => {
    if (!currentUser) {
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    setJoinTarget(challenge);
  };

  const sectionSubtitle = (status: RunStatus) => {
    const key = SECTION_SUBTITLE_KEY[status];
    return key ? t(key) : null;
  };

  const isFiltered = statusFilter !== "all" || searchQuery.trim() !== "";
  const triggerLabel = t(`filter_${statusFilter}`);

  return (
    <ExplorePageShell
      title={t("page_title")}
      subtitle={t("page_subtitle")}
      guestRedirect={pathname}
    >
      <ExploreToolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={t("search_placeholder")}
        searchClearLabel={t("search_clear")}
      >
        <FilterMenu
          label={triggerLabel}
          active={statusFilter !== "all"}
          triggerAriaLabel={t("filter_trigger_aria_label", { label: triggerLabel })}
          menuAriaLabel={t("filter_menu_aria_label")}
        >
          {CHALLENGE_STATUS_FILTERS.map((key) => (
            <FilterMenuItem
              key={key}
              label={t(`filter_${key}`)}
              checked={statusFilter === key}
              onToggle={() => setStatusFilter(key)}
            />
          ))}
        </FilterMenu>
      </ExploreToolbar>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner aria-label={t("loading")} />
        </div>
      )}

      {!isLoading && sections.length === 0 && (
        <ExploreEmpty
          title={isFiltered ? t("empty_filtered_title") : t("empty")}
          hint={isFiltered ? t("empty_filtered_hint") : null}
        />
      )}

      {sections.length > 0 && (
        <div className="flex flex-col gap-10">
          {sections.map((section) => (
            <ExploreSection
              key={section.status}
              title={t(`section_${section.status}`)}
              subtitle={sectionSubtitle(section.status)}
              count={section.items.length}
              Icon={RUN_STATUS_SECTION[section.status].Icon}
              muted={RUN_STATUS_SECTION[section.status].muted}
            >
              {section.items.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  onJoinClick={handleJoinClick}
                  onDrawClick={(target) => setDrawTarget(target.id)}
                  practiceId={practiceIdByChallenge.get(challenge.id)}
                  href={getExploreChallengeCardHref(
                    challenge,
                    practiceIdByChallenge.get(challenge.id)
                  )}
                />
              ))}
            </ExploreSection>
          ))}
        </div>
      )}

      <JoinChallengeDialog
        challenge={joinTarget}
        onOpenChange={(open) => {
          if (!open) setJoinTarget(null);
        }}
        onJoined={({ challengeId, practiceId }) => {
          // 同步先記下實踐 id，再並行 revalidate 兩份列表；任一份先回來時卡片都已有連結
          setJustJoinedPracticeIds((prev) => ({ ...prev, [challengeId]: practiceId }));
          void Promise.all([mutate(), mutateMine()]);
        }}
      />

      <InspirationDrawDialog
        challengeId={drawTarget}
        onOpenChange={(open) => {
          if (!open) setDrawTarget(null);
        }}
      />
    </ExplorePageShell>
  );
}
