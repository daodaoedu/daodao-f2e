"use client";

import {
  type IShowcaseFeedParams,
  type IShowcasePractice,
  useMyPractices,
  useMyPracticeStats,
  useShowcaseFeed,
} from "@daodao/api";
import { MessagesSvg } from "@daodao/assets";
import { useRouter, useSearchParams } from "@daodao/i18n/navigation";
import { cn } from "@daodao/ui/lib/utils";
import { CheckCircle2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AddTaskFAB,
  CompletedSection,
  DashboardHeader,
  InProgressSection,
  type InProgressTask,
} from "@/components/dashboard";
import type { CompletedTask } from "@/components/dashboard/completed-section";
import { BackgroundAnimation, Banner } from "@/components/layout";
import { RandomPracticesSection } from "@/components/practice/shared/random-practices-section";
import {
  BrewingCard,
  PracticeShowcaseCard,
  type ShowcaseFilterState,
  ShowcaseSearchBar,
} from "@/components/showcase";
import { PracticeStatus } from "@/constants/practice-status";
import {
  FilterStatus,
  type FilterStatus as FilterStatusType,
  mapPracticeStatusToTaskStatus,
} from "@/constants/task-status";

type TabType = "inspire" | "mine";

const filterOptions = [
  { value: FilterStatus.all, label: "全部" },
  { value: FilterStatus.draft, label: "草稿" },
  { value: FilterStatus.notStarted, label: "未開始" },
  { value: FilterStatus.inProgress, label: "進行中" },
  { value: FilterStatus.completed, label: "已完成" },
];

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<TabType>("inspire");
  const [searchValue, setSearchValue] = useState(searchParams.get("keyword") ?? "");
  const [filters, setFilters] = useState<ShowcaseFilterState>({
    tags: searchParams.getAll("tags[]"),
    durationMin: searchParams.get("duration_min")
      ? Number(searchParams.get("duration_min"))
      : undefined,
    durationMax: searchParams.get("duration_max")
      ? Number(searchParams.get("duration_max"))
      : undefined,
    status: (searchParams.get("status") as ShowcaseFilterState["status"]) ?? undefined,
  });
  const [keyword, setKeyword] = useState(searchParams.get("keyword") ?? "");
  const [filterStatus, setFilterStatus] = useState<FilterStatusType>(FilterStatus.all);

  // Sync URL params
  const updateUrlParams = useCallback(
    (kw: string, f: ShowcaseFilterState) => {
      const params = new URLSearchParams();
      if (kw) params.set("keyword", kw);
      if (f.status) params.set("status", f.status);
      if (f.durationMin != null) params.set("duration_min", String(f.durationMin));
      if (f.durationMax != null) params.set("duration_max", String(f.durationMax));
      f.tags.forEach((tag) => params.append("tags[]", tag));
      const qs = params.toString();
      router.replace(qs ? `?${qs}` : "?", { scroll: false });
    },
    [router]
  );

  const handleSearch = useCallback(
    (value: string) => {
      setKeyword(value);
      updateUrlParams(value, filters);
    },
    [filters, updateUrlParams]
  );

  const handleFiltersChange = useCallback(
    (newFilters: ShowcaseFilterState) => {
      setFilters(newFilters);
      updateUrlParams(keyword, newFilters);
    },
    [keyword, updateUrlParams]
  );

  // Showcase feed
  const feedParams: IShowcaseFeedParams = useMemo(
    () => ({
      keyword: keyword || undefined,
      tags: filters.tags.length > 0 ? filters.tags : undefined,
      duration_min: filters.durationMin,
      duration_max: filters.durationMax,
      status: filters.status,
      sort_by: "newest_updated",
    }),
    [keyword, filters]
  );

  const { practices, isLoading: isShowcaseLoading, hasMore, loadMore, isValidating } =
    useShowcaseFeed(feedParams);

  // Infinite scroll observer
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !isValidating) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, isValidating, loadMore]);

  // My practices
  const { data: allPracticesData, isLoading: isMyLoading } = useMyPractices({ limit: 16 });
  const { data: statsData } = useMyPracticeStats();

  const { inProgressTasks, completedTasks } = useMemo(() => {
    const practices = allPracticesData?.data || [];
    const inProgressTasksData: InProgressTask[] = [];
    const completedTasksData: CompletedTask[] = [];

    practices.forEach((practice) => {
      const isInProgress =
        practice.status === PracticeStatus.active ||
        practice.status === PracticeStatus.draft ||
        practice.status === PracticeStatus.notStarted;

      const lastCheckInDate = practice.lastCheckinAt ?? null;

      if (isInProgress) {
        inProgressTasksData.push({
          id: practice.id,
          label: "主題實踐",
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
      } else if (practice.status === PracticeStatus.completed) {
        completedTasksData.push({
          id: practice.id,
          label: "主題實踐",
          title: practice.title,
          description: practice.practiceAction || "",
          viewCount: 0,
          commentCount: 0,
          tags: practice.tags || [],
        });
      }
    });

    return { inProgressTasks: inProgressTasksData, completedTasks: completedTasksData };
  }, [allPracticesData]);

  const filteredInProgressTasks = useMemo(() => {
    if (filterStatus === FilterStatus.completed) return [];
    if (filterStatus === FilterStatus.all) return inProgressTasks;
    return inProgressTasks.filter((task) => task.status === filterStatus);
  }, [inProgressTasks, filterStatus]);

  const stats = useMemo(() => {
    const statsDataValue = statsData?.data;
    return [
      {
        label: "連續登入",
        value: String(statsDataValue?.currentStreak || 0),
        unit: "天",
        icon: CheckCircle2,
      },
      {
        label: "獲得迴響",
        value: String(statsDataValue?.totalCheckIns || 0),
        unit: "次",
        icon: MessagesSvg,
      },
    ];
  }, [statsData]);

  const hasPractices = inProgressTasks.length > 0 || completedTasks.length > 0;
  const showInProgress = filterStatus !== FilterStatus.completed;
  const showCompleted = filterStatus === FilterStatus.all || filterStatus === FilterStatus.completed;

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
              onClick={() => setActiveTab("inspire")}
              className={cn(
                "flex-1 py-2 text-sm font-medium transition-all",
                activeTab === "inspire"
                  ? "text-text-dark border-b-2 border-logo-cyan -mb-px"
                  : "text-text-dark/40"
              )}
            >
              靈感
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("mine")}
              className={cn(
                "flex-1 py-2 text-sm font-medium transition-all",
                activeTab === "mine"
                  ? "text-text-dark border-b-2 border-logo-cyan -mb-px"
                  : "text-text-dark/40"
              )}
            >
              我的
            </button>
          </div>

          {/* 靈感 Tab */}
          {activeTab === "inspire" && (
            <>
              <div className="mb-3">
                <ShowcaseSearchBar
                  value={searchValue}
                  onChange={setSearchValue}
                  onSearch={handleSearch}
                />
              </div>

              {isShowcaseLoading && practices.length === 0 ? (
                <div className="flex flex-col gap-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-white rounded-2xl p-4 h-48 animate-pulse border border-[#E8F8FF]"
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {practices.map((practice: IShowcasePractice) =>
                    practice.is_brewing ? (
                      <BrewingCard
                        key={practice.id}
                        id={practice.id}
                        title={practice.title}
                        startDate={practice.start_date}
                        endDate={practice.end_date}
                        user={
                          practice.user
                            ? {
                              id: practice.user.id,
                              name: practice.user.name,
                              photoUrl: practice.user.photo_url,
                            }
                            : undefined
                        }
                        actionDescription={practice.practice_action}
                        frequencyMinDays={practice.frequency_min_days}
                        frequencyMaxDays={practice.frequency_max_days}
                        sessionDurationMinutes={practice.session_duration_minutes}
                        commentCount={practice.comment_count}
                      />
                    ) : (
                      <PracticeShowcaseCard
                        key={practice.id}
                        id={practice.id}
                        title={practice.title}
                        status={practice.status}
                        startDate={practice.start_date}
                        endDate={practice.end_date}
                        user={
                          practice.user
                            ? {
                              id: practice.user.id,
                              name: practice.user.name,
                              photoUrl: practice.user.photo_url,
                            }
                            : undefined
                        }
                        actionDescription={practice.practice_action}
                        frequencyMinDays={practice.frequency_min_days}
                        frequencyMaxDays={practice.frequency_max_days}
                        sessionDurationMinutes={practice.session_duration_minutes}
                        commentCount={practice.comment_count}
                      />
                    )
                  )}

                  <div ref={sentinelRef} className="h-4" />

                  {isValidating && (
                    <div className="text-center py-4 text-text-dark/50 text-sm">載入中...</div>
                  )}
                </div>
              )}
            </>
          )}

          {/* 我的 Tab */}
          {activeTab === "mine" && (
            <>
              {isMyLoading ? (
                <div className="text-center text-text-dark">載入中...</div>
              ) : (
                <>
                  <DashboardHeader stats={stats} />
                  {!hasPractices && <RandomPracticesSection compact />}
                  {hasPractices && (
                    <>
                      <div className="mb-4">
                        <div
                          role="tablist"
                          aria-label="任務篩選"
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
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {showInProgress && <InProgressSection tasks={filteredInProgressTasks} />}
                      {showCompleted && <CompletedSection tasks={completedTasks} />}
                    </>
                  )}
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
