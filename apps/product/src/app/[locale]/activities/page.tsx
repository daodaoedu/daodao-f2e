"use client";

import { type ActivitySummaryType, useActivities, useLighthouseOrganizations } from "@daodao/api";
import { useAuthContext } from "@daodao/auth";
import { useTranslations } from "@daodao/i18n";
import { Link } from "@daodao/i18n/navigation";
import { Spinner } from "@daodao/ui/components/spinner";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { ActivityCard } from "@/components/activity/activity-card";
import { ExploreFilters } from "@/components/activity/explore-filters";
import { ExploreGuestHeader } from "@/components/activity/explore-guest-header";
import { ExploreSearch } from "@/components/activity/explore-search";
import { HostPreviewDialog } from "@/components/activity/host-preview-dialog";
import { PageHeader, Sidebar } from "@/components/layout";
import {
  type ActivityFeeFilter,
  type ActivityStatusFilter,
  searchActivities,
} from "@/constants/activity-filter";

const SECTION_TITLE_KEY: Record<ActivityStatusFilter, string> = {
  all: "section_title_all",
  open: "section_title_open",
  ongoing: "section_title_ongoing",
  ended: "section_title_ended",
};

export default function ExploreActivitiesPage() {
  const t = useTranslations("explore_activities");
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthContext();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ActivityStatusFilter>("all");
  const [feeFilter, setFeeFilter] = useState<ActivityFeeFilter>(null);

  const [hostDialogUserId, setHostDialogUserId] = useState<number | null>(null);
  const [hostDialogOpen, setHostDialogOpen] = useState(false);

  const { data, isLoading: dataLoading } = useActivities();
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
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const content = (
    <ExploreContent
      t={t}
      isAuthenticated={isAuthenticated}
      filtered={filtered}
      dataLoading={dataLoading}
      activitiesEmpty={activities.length === 0}
      statusFilter={statusFilter}
      feeFilter={feeFilter}
      searchQuery={searchQuery}
      meta={meta}
      onStatusChange={setStatusFilter}
      onFeeChange={setFeeFilter}
      onSearchChange={setSearchQuery}
      onSearchClear={() => setSearchQuery("")}
      onHostClick={handleHostClick}
    />
  );

  return (
    <>
      {isAuthenticated ? (
        <>
          <div className="md:pl-[132px]">
            <PageHeader
              leftAction="back"
              onLeftAction={() => router.push("/spaces")}
              rightActionTo="/spaces"
              title={t("page_title")}
            />
            {content}
          </div>
          <Sidebar />
        </>
      ) : (
        <>
          <ExploreGuestHeader />
          <div className="mx-auto max-w-[760px] px-4 pt-8 pb-6">
            <h1 className="text-center text-2xl font-bold text-bg-dark">{t("page_title")}</h1>
            <p className="mt-2 text-center text-sm text-text-dark/60">{t("page_subtitle")}</p>
          </div>
          {content}
        </>
      )}

      <HostPreviewDialog
        userId={hostDialogUserId}
        open={hostDialogOpen}
        onOpenChange={setHostDialogOpen}
      />
    </>
  );
}

interface ExploreContentProps {
  t: ReturnType<typeof useTranslations<"explore_activities">>;
  isAuthenticated: boolean;
  filtered: ActivitySummaryType[];
  dataLoading: boolean;
  activitiesEmpty: boolean;
  statusFilter: ActivityStatusFilter;
  feeFilter: ActivityFeeFilter;
  searchQuery: string;
  meta?: { endedTruncated?: boolean };
  onStatusChange: (f: ActivityStatusFilter) => void;
  onFeeChange: (f: ActivityFeeFilter) => void;
  onSearchChange: (v: string) => void;
  onSearchClear: () => void;
  onHostClick: (userId: number) => void;
}

function ExploreContent({
  t,
  isAuthenticated,
  filtered,
  dataLoading,
  activitiesEmpty,
  statusFilter,
  feeFilter,
  searchQuery,
  meta,
  onStatusChange,
  onFeeChange,
  onSearchChange,
  onSearchClear,
  onHostClick,
}: ExploreContentProps) {
  return (
    <main className="mx-auto flex w-full max-w-[760px] flex-col gap-6 px-4 pt-6 pb-20">
      <ExploreSearch value={searchQuery} onChange={onSearchChange} onClear={onSearchClear} />

      <ExploreFilters
        statusFilter={statusFilter}
        onStatusChange={onStatusChange}
        feeFilter={feeFilter}
        onFeeChange={onFeeChange}
      />

      {dataLoading ? (
        <div className="flex justify-center py-16">
          <Spinner aria-label={t("loading")} />
        </div>
      ) : (
        <>
          <div className="flex items-baseline gap-2">
            <h2 className="text-[17px] font-bold text-text-dark">
              {t(SECTION_TITLE_KEY[statusFilter])}
            </h2>
            <span className="text-[13px] text-text-dark/45">{filtered.length}</span>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-[20px] border border-dashed border-[#D4E5E4] bg-white px-6 py-12">
              <p className="text-sm font-medium text-text-dark/70">
                {activitiesEmpty ? t("empty_no_data") : t("empty_title")}
              </p>
              {!activitiesEmpty && (
                <p className="text-[13px] text-text-dark/50">{t("empty_hint")}</p>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {filtered.map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    onHostClick={activity.host.userId ? onHostClick : undefined}
                  />
                ))}
              </div>

              {statusFilter === "ended" && meta?.endedTruncated && (
                <p className="text-center text-sm text-text-dark/50">{t("ended_truncated")}</p>
              )}
            </>
          )}

          <BottomCta t={t} isAuthenticated={isAuthenticated} />
        </>
      )}
    </main>
  );
}

function BottomCta({
  t,
  isAuthenticated,
}: {
  t: ReturnType<typeof useTranslations<"explore_activities">>;
  isAuthenticated: boolean;
}) {
  const { data: orgs } = useLighthouseOrganizations();
  const hasLighthouseOrg = (orgs?.data ?? []).length > 0;

  const ctaHref = isAuthenticated
    ? hasLighthouseOrg
      ? "/lighthouse/programs"
      : "/spaces"
    : "/auth/login?redirect=/activities";

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
