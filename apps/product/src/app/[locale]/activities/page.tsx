"use client";

import { type ActivitySummaryType, useActivities } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { Link } from "@daodao/i18n/navigation";
import { Spinner } from "@daodao/ui/components/spinner";
import { cn } from "@daodao/ui/lib/utils";
import { Compass, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { ActivityCard } from "@/components/activity/activity-card";

type FilterKey = "all" | "open";

const FILTERS: FilterKey[] = ["all", "open"];

/**
 * 探索活動課程頁（公開）：資料來自 GET /api/v1/activities，
 * 只列出組織在燈塔後台設為公開、已發佈且未結束的期，依運行狀態分「即將開始／進行中」。
 * cohort 沒有線上／實體與地點欄位，篩選只保留「全部／開放加入中」（proposal Non-goals）。
 */
export default function ExploreActivitiesPage() {
  const t = useTranslations("explore_activities");
  const { data, isLoading } = useActivities();
  const [filter, setFilter] = useState<FilterKey>("all");

  const activities = useMemo(() => data?.data ?? [], [data]);
  const sections = useMemo(() => {
    const visible =
      filter === "open" ? activities.filter((activity) => activity.canJoin) : activities;
    const byStatus = (status: ActivitySummaryType["runStatus"]) =>
      visible.filter((activity) => activity.runStatus === status);
    return { upcoming: byStatus("upcoming"), ongoing: byStatus("ongoing") };
  }, [activities, filter]);
  const isEmpty = sections.upcoming.length === 0 && sections.ongoing.length === 0;

  return (
    <main className="mx-auto flex w-full max-w-[640px] flex-col gap-10 px-4 pt-8 pb-18">
      <header className="flex flex-col gap-2">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-bg-dark">
          <Compass className="size-6 text-logo-cyan" />
          {t("page_title")}
        </h1>
        <p className="text-sm text-text-dark">{t("page_subtitle")}</p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={cn(
              "h-[30px] cursor-pointer rounded-full border px-3.5 text-sm whitespace-nowrap transition-colors",
              filter === key
                ? "border-logo-cyan bg-logo-cyan text-white"
                : "border-[#DCEBEA] bg-white text-text-dark/75 hover:border-logo-cyan/50"
            )}
          >
            {t(`filter_${key}`)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner aria-label={t("loading")} />
        </div>
      ) : isEmpty ? (
        <p className="py-10 text-center text-sm text-text-dark">{t("empty")}</p>
      ) : (
        <>
          {sections.upcoming.length > 0 && (
            <section>
              <div className="flex items-center gap-2">
                <Sparkles className="size-4.5 text-logo-cyan" />
                <h2 className="m-0 text-lg font-bold text-bg-dark">{t("section_open_title")}</h2>
                <span className="text-sm text-text-dark/40">· {sections.upcoming.length}</span>
              </div>
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {sections.upcoming.map((activity) => (
                  <ActivityCard key={activity.id} activity={activity} />
                ))}
              </div>
            </section>
          )}

          {sections.ongoing.length > 0 && (
            <section>
              <div className="flex items-center gap-2">
                <h2 className="m-0 text-lg font-bold text-bg-dark">{t("section_ongoing_title")}</h2>
                <span className="text-sm text-text-dark/40">· {sections.ongoing.length}</span>
              </div>
              <p className="mt-1.5 text-sm text-text-dark/70">{t("section_ongoing_subtitle")}</p>
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {sections.ongoing.map((activity) => (
                  <ActivityCard key={activity.id} activity={activity} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <div className="flex flex-wrap items-center justify-center gap-2.5 rounded-[20px] border border-dashed border-[#D4E5E4] bg-white px-6 py-5.5">
        <span className="text-[13.5px] text-text-dark/65">{t("cta_prompt")}</span>
        <Link
          href="/spaces"
          className="inline-flex h-8 items-center rounded-full bg-logo-cyan px-4 text-[13px] font-semibold text-white transition-colors hover:bg-logo-cyan/90"
        >
          {t("cta_button")}
        </Link>
      </div>
    </main>
  );
}
