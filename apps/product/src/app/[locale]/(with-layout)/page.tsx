"use client";

import {
  type BatchReactionItem,
  type IShowcasePractice,
  useMyPracticeStats,
  useMyPractices,
  useReactionsBatch,
  useShowcaseFeed,
} from "@daodao/api";
import { MessagesSvg } from "@daodao/assets";
import { useRouter, useSearchParams } from "@daodao/i18n/navigation";
import { cn } from "@daodao/ui/lib/utils";
import { CheckCircle2, Rss, ThumbsUp } from "lucide-react";
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
  CheckInShowcaseCard,
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

// ── Feed Label ────────────────────────────────────────────────────────────────

function CalendarCheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
      aria-hidden="true"
    >
      <path
        d="M20.25 10.75H3.75V20C3.75 20.6904 4.30964 21.25 5 21.25H19C19.6904 21.25 20.25 20.6904 20.25 20V10.75ZM14.4697 13.4697C14.7626 13.1768 15.2374 13.1768 15.5303 13.4697C15.8232 13.7626 15.8232 14.2374 15.5303 14.5303L11.5303 18.5303C11.2374 18.8232 10.7626 18.8232 10.4697 18.5303L8.46973 16.5303C8.17683 16.2374 8.17683 15.7626 8.46973 15.4697C8.76262 15.1768 9.23738 15.1768 9.53027 15.4697L11 16.9395L14.4697 13.4697ZM15.25 6V4.75H8.75V6C8.75 6.41421 8.41421 6.75 8 6.75C7.58579 6.75 7.25 6.41421 7.25 6V4.75H5C4.30964 4.75 3.75 5.30964 3.75 6V9.25H20.25V6C20.25 5.30964 19.6904 4.75 19 4.75H16.75V6C16.75 6.41421 16.4142 6.75 16 6.75C15.5858 6.75 15.25 6.41421 15.25 6ZM21.75 20C21.75 21.5188 20.5188 22.75 19 22.75H5C3.48122 22.75 2.25 21.5188 2.25 20V6C2.25 4.48122 3.48122 3.25 5 3.25H7.25V2C7.25 1.58579 7.58579 1.25 8 1.25C8.41421 1.25 8.75 1.58579 8.75 2V3.25H15.25V2C15.25 1.58579 15.5858 1.25 16 1.25C16.4142 1.25 16.75 1.58579 16.75 2V3.25H19C20.5188 3.25 21.75 4.48122 21.75 6V20Z"
        fill="currentColor"
      />
    </svg>
  );
}

function FeedLabel({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-text-dark/50 px-1 mb-1">
      {icon}
      <span>{text}</span>
    </div>
  );
}

// ── Mock 打卡資料（開發預覽用） ───────────────────────────────────────────────

const mockCheckinReactions: BatchReactionItem = {
  reactions: [
    { type: "useful", count: 5, latestActorName: "Anna" },
    { type: "touched", count: 3, latestActorName: null },
  ],
  currentUserReaction: null,
  items: [
    {
      userId: "u-anna",
      name: "Anna",
      photoURL: null,
      reactionType: "useful",
      reactedAt: "2026-03-31T10:00:00Z",
    },
  ],
};

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
  const [filters, _setFilters] = useState<ShowcaseFilterState>({
    tags: searchParams.getAll("tags[]"),
  });
  const [keyword, setKeyword] = useState(searchParams.get("keyword") ?? "");
  const [filterStatus, setFilterStatus] = useState<FilterStatusType>(FilterStatus.all);

  // Sync URL params
  const updateUrlParams = useCallback(
    (kw: string, f: ShowcaseFilterState) => {
      const params = new URLSearchParams();
      if (kw) params.set("keyword", kw);
      for (const tag of f.tags) {
        params.append("tags[]", tag);
      }
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

  // Showcase feed (practice only)
  const showcaseParams = useMemo(
    () => ({
      keyword: keyword || undefined,
      tags: filters.tags.length > 0 ? filters.tags : undefined,
    }),
    [keyword, filters]
  );

  const {
    practices,
    isLoading: isShowcaseLoading,
    hasMore,
    loadMore,
    isValidating,
  } = useShowcaseFeed(showcaseParams);

  // Batch fetch reactions for all visible practices
  const practiceIds = useMemo(() => practices.map((p: IShowcasePractice) => p.id), [practices]);
  const { data: batchReactionsData, mutate: mutateBatchReactions } = useReactionsBatch({
    targetType: "practice",
    targetIds: practiceIds,
  });

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
  const showCompleted =
    filterStatus === FilterStatus.all || filterStatus === FilterStatus.completed;

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
                  {/* Mock 打卡卡片（開發預覽用） */}
                  <div>
                    <FeedLabel
                      icon={<CalendarCheckIcon />}
                      text="Joy 在 練習兩個物體的結合，也覺有趣的！！ 打卡"
                    />
                    <CheckInShowcaseCard
                      id="mock-checkin-1"
                      checkin_date="2026/03/31"
                      mood="happy"
                      note="雖然網路上很多免費筆刷可以下載，但 Procreate 內建的筆刷就很夠用了"
                      tags={["Procreate", "數位繪圖"]}
                      image_urls={[]}
                      created_at="2026-03-31T10:00:00Z"
                      practice={{
                        id: "mock-practice-1",
                        title: "練習兩個物體的結合，也覺有趣的！！",
                      }}
                      user={{ id: "mock-user-1", name: "Joy", photo_url: null }}
                      comment_count={3}
                      batchReactionData={mockCheckinReactions}
                      comment_preview={[
                        {
                          id: "mock-comment-1",
                          content: "好厲害！繼續加油！",
                          user: { id: "mock-user-2", name: "小明", photo_url: null },
                          created_at: "2026-03-31T11:00:00Z",
                        },
                      ]}
                    />
                  </div>

                  {practices.map((practice: IShowcasePractice) =>
                    practice.is_brewing ? (
                      <div key={practice.id}>
                        <FeedLabel icon={<Rss className="size-3.5" />} text="最新發布" />
                        <BrewingCard
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
                          batchReactionData={batchReactionsData?.data?.[practice.id]}
                          onReactionMutate={() => mutateBatchReactions()}
                        />
                      </div>
                    ) : (
                      <div key={practice.id}>
                        <FeedLabel
                          icon={<ThumbsUp className="size-3.5" />}
                          text={`${practice.user?.name ?? "有人"} 發布了新實踐`}
                        />
                        <PracticeShowcaseCard
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
                          batchReactionData={batchReactionsData?.data?.[practice.id]}
                          onReactionMutate={() => mutateBatchReactions()}
                        />
                      </div>
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
          {activeTab === "mine" &&
            (isMyLoading ? (
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
            ))}
        </div>
      </main>

      <AddTaskFAB onAddTask={() => router.push("/practices/create")} />
    </div>
  );
}
