"use client";

import { useMyPracticeStats, useMyPractices } from "@daodao/api";
import { MessagesSvg } from "@daodao/assets";
import { useAuth } from "@daodao/auth";
import { useTranslations } from "@daodao/i18n";
import { Link, useRouter } from "@daodao/i18n/navigation";
import { cn } from "@daodao/ui/lib/utils";
import { CheckCircle2, ChevronRight, Flag, HeartHandshake, ScrollText } from "lucide-react";
import { useMemo, useState } from "react";
import {
  AddTaskFAB,
  DashboardHeader,
  InProgressSection,
  type InProgressTask,
  RecommendationSection,
} from "@/components/dashboard";
import { BackgroundAnimation, Banner } from "@/components/layout";
import { RandomPracticesSection } from "@/components/practice/shared/random-practices-section";
import { HOME_TAB_PATHS } from "@/constants/home-navigation";
import {
  FilterStatus,
  type FilterStatus as FilterStatusType,
  mapPracticeStatusToTaskStatus,
} from "@/constants/task-status";
import { applyMineFilter, buildMineFilterCounts } from "@/utils/mine-filter";

const filterOptions = [
  { value: FilterStatus.all, labelKey: "filter_all" },
  { value: FilterStatus.inProgress, labelKey: "filter_in_progress" },
  { value: FilterStatus.draft, labelKey: "filter_draft" },
  { value: FilterStatus.notStarted, labelKey: "filter_not_started" },
  { value: FilterStatus.completed, labelKey: "filter_completed" },
] as const;

export default function MyPage() {
  const router = useRouter();
  const t = useTranslations("dashboard");
  const { isAuthenticated, isLoading: isAuthLoading, login } = useAuth();
  const [filterStatus, setFilterStatus] = useState<FilterStatusType>(FilterStatus.all);

  const { data: allPracticesData, isLoading: isMyLoading } = useMyPractices({ limit: 16 });
  const { data: statsData } = useMyPracticeStats();

  const { inProgressTasks } = useMemo(() => {
    const practices = allPracticesData?.data || [];
    const inProgressTasksData: InProgressTask[] = [];

    practices.forEach((practice) => {
      const lastCheckInDate = practice.lastCheckinAt ?? null;
      inProgressTasksData.push({
        id: practice.id,
        title: practice.title,
        description: practice.practiceAction || "",
        checkInCount: practice.checkInCount,
        progress: practice.progressPercentage ?? 0,
        messagesCount: 0,
        isUnreadMessages: false,
        theme: practice.themeColor || "#FCDD84",
        status: mapPracticeStatusToTaskStatus(practice.status),
        lastCheckInDate,
        startDate: practice.startDate || null,
        endDate: practice.endDate || null,
      });
    });

    return { inProgressTasks: inProgressTasksData };
  }, [allPracticesData, t]);

  const filteredInProgressTasks = useMemo(
    () => applyMineFilter(inProgressTasks, filterStatus),
    [inProgressTasks, filterStatus]
  );

  const stats = useMemo(() => {
    const statsDataValue = statsData?.data;
    return [
      {
        label: t("stats_streak_label"),
        value: String(statsDataValue?.currentStreak || 0),
        unit: t("stats_streak_unit"),
        icon: CheckCircle2,
      },
      {
        label: t("stats_responses_label"),
        value: String(statsDataValue?.totalCheckIns || 0),
        unit: t("stats_responses_unit"),
        icon: MessagesSvg,
      },
    ];
  }, [statsData, t]);

  const hasPractices = inProgressTasks.length > 0;

  const filterCounts = useMemo(() => buildMineFilterCounts(inProgressTasks), [inProgressTasks]);

  return (
    <div className="relative min-h-screen">
      <Banner />
      <BackgroundAnimation />

      <main className="relative z-[25] pb-[72px] bg-very-light-gray">
        <div className="max-w-[640px] px-4 mx-auto pt-4">
          {/* Tab Switcher */}
          <div className="flex border-b border-[#E5E7EB] mb-4">
            <button
              type="button"
              onClick={() => router.replace(HOME_TAB_PATHS.inspire)}
              className={cn("flex-1 py-2 text-sm font-medium transition-all", "text-text-dark/40")}
            >
              {t("tab_inspire")}
            </button>
            <button
              type="button"
              className={cn(
                "flex-1 py-2 text-sm font-medium transition-all",
                "text-text-dark border-b-2 border-logo-cyan -mb-px"
              )}
            >
              {t("tab_mine")}
            </button>
            <button
              type="button"
              onClick={() => router.replace(HOME_TAB_PATHS.persona)}
              className={cn("flex-1 py-2 text-sm font-medium transition-all", "text-text-dark/40")}
            >
              {t("tab_persona")}
            </button>
          </div>

          {/* POC 功能入口：季度報告 / 共同挑戰 */}
          <div className="mb-4 grid grid-cols-2 gap-3">
            <Link
              href="/quarterly-report"
              className="flex items-center gap-2.5 rounded-2xl border border-[#E4EAE9] bg-white p-3.5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#E8F8F7]">
                <ScrollText className="size-4.5 text-logo-cyan" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-text-dark">季度報告</p>
                <p className="truncate text-xs text-text-secondary">回顧成長足跡</p>
              </div>
              <ChevronRight className="size-4 shrink-0 text-text-secondary" />
            </Link>
            <Link
              href="/me/challenges"
              className="flex items-center gap-2.5 rounded-2xl border border-[#E4EAE9] bg-white p-3.5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#FFF4E3]">
                <Flag className="size-4.5 text-[#FFA10B]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-text-dark">我的挑戰</p>
                <p className="truncate text-xs text-text-secondary">一群人一起完成</p>
              </div>
              <ChevronRight className="size-4 shrink-0 text-text-secondary" />
            </Link>
            <Link
              href="/companion/writing-circle"
              className="col-span-2 flex items-center gap-2.5 rounded-2xl border border-[#E4EAE9] bg-white p-3.5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#F3F8E3]">
                <HeartHandshake className="size-4.5 text-[#7BA428]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-text-dark">我的陪伴計畫</p>
                <p className="truncate text-xs text-text-secondary">寫作陪伴圈 · 阿島老師陪你走</p>
              </div>
              <ChevronRight className="size-4 shrink-0 text-text-secondary" />
            </Link>
          </div>

          {!isAuthLoading && !isAuthenticated ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
              <p className="text-lg font-semibold text-text-dark">{t("not_logged_in_title")}</p>
              <p className="text-sm text-text-dark/60">{t("not_logged_in_description")}</p>
              <button
                type="button"
                onClick={() => login()}
                className="px-6 py-2.5 rounded-full bg-primary-base text-white text-sm font-medium"
              >
                {t("not_logged_in_action")}
              </button>
            </div>
          ) : isMyLoading ? (
            <div className="text-center text-text-dark">{t("loading")}</div>
          ) : (
            <>
              <DashboardHeader stats={stats} />
              {!hasPractices && <RandomPracticesSection compact />}
              {hasPractices && (
                <>
                  <div className="mb-4">
                    <div
                      role="tablist"
                      aria-label={t("filter_aria_label")}
                      className="flex gap-2 overflow-x-auto scrollbar-hide"
                    >
                      {filterOptions.map((option) => (
                        <button
                          type="button"
                          key={option.value}
                          role="tab"
                          aria-selected={filterStatus === option.value}
                          onClick={() => setFilterStatus(option.value)}
                          className={cn(
                            "px-5 py-2 rounded-full text-sm whitespace-nowrap border transition-colors",
                            filterStatus === option.value
                              ? "bg-primary-base border-primary-base text-white"
                              : "bg-white border-primary-base text-primary-base"
                          )}
                        >
                          {t(option.labelKey)} {filterCounts[option.value]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <InProgressSection tasks={filteredInProgressTasks} />
                  <RecommendationSection
                    onGoToInspire={() => router.replace(HOME_TAB_PATHS.inspire)}
                  />
                </>
              )}
            </>
          )}
        </div>
      </main>

      <AddTaskFAB onAddTask={() => router.push("/practices/create")} />
    </div>
  );
}
