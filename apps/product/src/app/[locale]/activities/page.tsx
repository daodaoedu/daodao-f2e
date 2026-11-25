"use client";

import { type ActivitySummaryType, useActivities, useLighthouseOrganizations } from "@daodao/api";
import { useAuthContext } from "@daodao/auth";
import { useTranslations } from "@daodao/i18n";
import { Link } from "@daodao/i18n/navigation";
import { Button } from "@daodao/ui/components/button";
import { FilterMenu, FilterMenuItem } from "@daodao/ui/components/filter-menu";
import { Spinner } from "@daodao/ui/components/spinner";
import { useCallback, useMemo, useState } from "react";
import { ActivityCard } from "@/components/activity/activity-card";
import { HostPreviewDialog } from "@/components/activity/host-preview-dialog";
import { ExploreEmpty } from "@/components/explore/explore-empty";
import { ExplorePageShell } from "@/components/explore/explore-page-shell";
import { ExploreSection } from "@/components/explore/explore-section";
import { ExploreToolbar } from "@/components/explore/explore-toolbar";
import { groupByRunStatus } from "@/components/explore/group-by-run-status";
import { RUN_STATUS_SECTION } from "@/components/explore/section-icons";
import { Footer } from "@/components/layout";
import { WithLayoutFrame } from "@/components/layout/with-layout-frame";
import { CohortErrorState } from "@/components/lighthouse/cohort-error-state";
import {
  ACTIVITY_STATUS_FILTERS,
  type ActivityFeeFilter,
  type ActivityStatusFilter,
  searchActivities,
} from "@/constants/activity-filter";

/** daodao#567：背景與首頁一致（very-light-gray），取代 FR-EX-16(a) 的 very-light-blue */
const PAGE_BACKGROUND = "min-h-screen bg-very-light-gray";

const FEE_OPTIONS = ["free", "paid"] as const;

/** 單一狀態篩選時的分區圖示：開放報名＝即將開始的星星 */
const FILTER_SECTION: Record<
  Exclude<ActivityStatusFilter, "all">,
  keyof typeof RUN_STATUS_SECTION
> = {
  open: "upcoming",
  ongoing: "ongoing",
  ended: "ended",
};

type ExploreActivitiesT = ReturnType<typeof useTranslations<"explore_activities">>;

export default function ExploreActivitiesPage() {
  const t = useTranslations("explore_activities");
  const tAuth = useTranslations("auth.privateAccessUnavailable");
  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
    authCheckUnavailable,
    refreshAuth,
  } = useAuthContext();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ActivityStatusFilter>("all");
  const [feeFilter, setFeeFilter] = useState<ActivityFeeFilter>(null);

  const [hostDialogUserId, setHostDialogUserId] = useState<number | null>(null);
  const [hostDialogOpen, setHostDialogOpen] = useState(false);

  const { data, isLoading: dataLoading } = useActivities(
    undefined,
    authLoading || authCheckUnavailable ? undefined : (user?.id ?? null)
  );
  const activities = useMemo(() => (data?.data ?? []) as ActivitySummaryType[], [data]);
  const meta = data?.meta as { endedTruncated?: boolean } | undefined;

  const filtered = useMemo(
    () => searchActivities(activities, searchQuery, statusFilter, feeFilter),
    [activities, searchQuery, statusFilter, feeFilter]
  );

  const handleHostClick = useCallback((userId: number) => {
    setHostDialogUserId(userId);
    setHostDialogOpen(true);
  }, []);

  if (authLoading) {
    return (
      <div className={`${PAGE_BACKGROUND} flex items-center justify-center`}>
        <Spinner />
      </div>
    );
  }

  if (authCheckUnavailable) {
    return (
      <main className={PAGE_BACKGROUND}>
        <CohortErrorState
          message={tAuth("title")}
          retryLabel={tAuth("retry")}
          onRetry={() => void refreshAuth()}
        />
      </main>
    );
  }

  const page = (
    <ExplorePageShell
      title={t("page_title")}
      subtitle={t("page_subtitle")}
      isGuest={!isAuthenticated}
      guestRedirect="/activities"
    >
      <ExploreToolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={t("search_placeholder")}
        searchClearLabel={t("search_clear")}
      >
        <ActivityFilterMenu
          t={t}
          statusFilter={statusFilter}
          feeFilter={feeFilter}
          onStatusChange={setStatusFilter}
          onFeeChange={setFeeFilter}
        />
      </ExploreToolbar>

      {dataLoading ? (
        <div className="flex justify-center py-16">
          <Spinner aria-label={t("loading")} />
        </div>
      ) : (
        <>
          <ActivityList
            t={t}
            filtered={filtered}
            activitiesEmpty={activities.length === 0}
            statusFilter={statusFilter}
            onHostClick={handleHostClick}
          />
          {statusFilter === "ended" && meta?.endedTruncated && filtered.length > 0 && (
            <p className="text-center text-sm text-text-dark/50">{t("ended_truncated")}</p>
          )}
          <BottomCta t={t} isAuthenticated={isAuthenticated} />
        </>
      )}
    </ExplorePageShell>
  );

  return (
    <>
      {/* 與 (with-layout) 頁面同一個外框：登入有側邊導覽，訪客不留側欄空位 */}
      <WithLayoutFrame>
        {page}
        <Footer />
      </WithLayoutFrame>

      <HostPreviewDialog
        userId={hostDialogUserId}
        open={hostDialogOpen}
        onOpenChange={setHostDialogOpen}
      />
    </>
  );
}

/**
 * 狀態、費用各一個下拉（Meetup 做法：一個面向一個篩選），有套用時出現「清除篩選」（daodao#567）。
 * 已套用的條件直接寫在觸發鈕上，關掉選單也看得到（Baymard：已套用的篩選要保持可見）。
 */
function ActivityFilterMenu({
  t,
  statusFilter,
  feeFilter,
  onStatusChange,
  onFeeChange,
}: {
  t: ExploreActivitiesT;
  statusFilter: ActivityStatusFilter;
  feeFilter: ActivityFeeFilter;
  onStatusChange: (f: ActivityStatusFilter) => void;
  onFeeChange: (f: ActivityFeeFilter) => void;
}) {
  const statusLabel = t(`filter_${statusFilter}`);
  const feeLabel = feeFilter === null ? t("filter_group_fee") : t(`filter_${feeFilter}`);
  const isFiltered = statusFilter !== "all" || feeFilter !== null;

  return (
    <>
      <FilterMenu
        label={statusLabel}
        active={statusFilter !== "all"}
        triggerAriaLabel={t("filter_trigger_aria_label", {
          label: `${t("filter_group_status")}：${statusLabel}`,
        })}
        menuAriaLabel={t("filter_status_menu_aria_label")}
      >
        {ACTIVITY_STATUS_FILTERS.map((key) => (
          <FilterMenuItem
            key={key}
            label={t(`filter_${key}`)}
            checked={statusFilter === key}
            onToggle={() => onStatusChange(key)}
          />
        ))}
      </FilterMenu>
      <FilterMenu
        label={feeLabel}
        active={feeFilter !== null}
        triggerAriaLabel={t("filter_trigger_aria_label", {
          label: `${t("filter_group_fee")}：${feeFilter === null ? t("filter_all") : feeLabel}`,
        })}
        menuAriaLabel={t("filter_fee_menu_aria_label")}
      >
        <FilterMenuItem
          label={t("filter_all")}
          checked={feeFilter === null}
          onToggle={() => onFeeChange(null)}
        />
        {FEE_OPTIONS.map((key) => (
          <FilterMenuItem
            key={key}
            label={t(`filter_${key}`)}
            checked={feeFilter === key}
            onToggle={() => onFeeChange(feeFilter === key ? null : key)}
          />
        ))}
      </FilterMenu>
      {isFiltered && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 shrink-0 rounded-full px-2.5 text-sm text-text-dark/60 hover:text-text-dark"
          onClick={() => {
            onStatusChange("all");
            onFeeChange(null);
          }}
        >
          {t("filter_clear")}
        </Button>
      )}
    </>
  );
}

function ActivityList({
  t,
  filtered,
  activitiesEmpty,
  statusFilter,
  onHostClick,
}: {
  t: ExploreActivitiesT;
  filtered: ActivitySummaryType[];
  activitiesEmpty: boolean;
  statusFilter: ActivityStatusFilter;
  onHostClick: (userId: number) => void;
}) {
  if (filtered.length === 0) {
    return activitiesEmpty ? (
      <ExploreEmpty title={t("empty_no_data")} />
    ) : (
      <ExploreEmpty title={t("empty_title")} hint={t("empty_hint")} />
    );
  }

  const renderCards = (items: ActivitySummaryType[]) =>
    items.map((activity) => (
      <ActivityCard
        key={activity.id}
        activity={activity}
        onHostClick={activity.host.userId ? onHostClick : undefined}
      />
    ));

  if (statusFilter !== "all") {
    const section = RUN_STATUS_SECTION[FILTER_SECTION[statusFilter]];
    return (
      <ExploreSection
        title={t(`section_title_${statusFilter}`)}
        count={filtered.length}
        Icon={section.Icon}
        muted={section.muted}
      >
        {renderCards(filtered)}
      </ExploreSection>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {groupByRunStatus(filtered).map((group) => (
        <ExploreSection
          key={group.status}
          title={t(`section_title_${group.status}`)}
          count={group.items.length}
          Icon={RUN_STATUS_SECTION[group.status].Icon}
          muted={RUN_STATUS_SECTION[group.status].muted}
        >
          {renderCards(group.items)}
        </ExploreSection>
      ))}
    </div>
  );
}

function BottomCta({ t, isAuthenticated }: { t: ExploreActivitiesT; isAuthenticated: boolean }) {
  const { data: orgs } = useLighthouseOrganizations();
  const hasLighthouseOrg = (orgs?.data ?? []).length > 0;

  const userHref = hasLighthouseOrg ? "/lighthouse/programs" : "/spaces";
  const ctaHref = isAuthenticated ? userHref : "/auth/login?redirect=/activities";

  return (
    <div className="flex flex-wrap items-center justify-center gap-2.5 rounded-[20px] border border-dashed border-[#D4E5E4] bg-white px-6 py-5.5">
      <span className="text-[13.5px] text-text-dark/65">
        {isAuthenticated ? t("cta_user_prompt") : t("cta_guest_prompt")}
      </span>
      <Link
        href={ctaHref}
        className="inline-flex h-8 items-center rounded-full bg-logo-cyan px-4 text-[13px] font-semibold text-white transition-colors hover:bg-logo-cyan/90"
      >
        {isAuthenticated ? t("cta_user_button") : t("cta_guest_button")}
      </Link>
    </div>
  );
}
