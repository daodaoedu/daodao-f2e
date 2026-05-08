"use client";

import {
  type ActivityCardItem,
  type FeedItem,
  useFeed,
  useMyPracticeStats,
  useMyPractices,
  useReactionsBatch,
} from "@daodao/api";
import { MessagesSvg } from "@daodao/assets";
import { useRouter, useSearchParams } from "@daodao/i18n/navigation";
import { cn } from "@daodao/ui/lib/utils";
import { CheckCircle2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AddTaskFAB,
  DashboardHeader,
  InProgressSection,
  type InProgressTask,
  RecommendationSection,
} from "@/components/dashboard";
import { BackgroundAnimation, Banner } from "@/components/layout";
import { RandomPracticesSection } from "@/components/practice/shared/random-practices-section";
import {
  ActivityCard,
  BrewingCard,
  CheckInShowcaseCard,
  FeedLabel,
  PracticeShowcaseCard,
  type ShowcaseFilterState,
  ShowcaseSearchBar,
} from "@/components/showcase";
import {
  FilterStatus,
  type FilterStatus as FilterStatusType,
  mapPracticeStatusToTaskStatus,
} from "@/constants/task-status";

type TabType = "inspire" | "mine";

// Reorder feed items into the cycle: [打卡 1] → [互動 1] → [實踐 3] → repeat
// 互動 slot: feed_reason="cheered" 的卡片優先，不足時 fallback 到文字 ActivityCard
function reorderFeedItems(items: FeedItem[]): FeedItem[] {
  const checkins: Extract<FeedItem, { type: "checkin" }>[] = [];
  const cheered: Extract<FeedItem, { type: "practice" | "checkin" }>[] = [];
  const textActivities: ActivityCardItem[] = [];
  const practices: Extract<FeedItem, { type: "practice" }>[] = [];

  for (const item of items) {
    if (item.type === "checkin" || item.type === "practice") {
      if (item.feed_reason === "cheered") {
        cheered.push(item);
      } else if (item.type === "checkin") {
        checkins.push(item);
      } else {
        practices.push(item);
      }
    } else if (item.type === "activity") {
      textActivities.push(item as ActivityCardItem);
    }
  }

  // 互動 slot 來源：cheered 優先，用完再接文字 ActivityCard
  const activitySlot: FeedItem[] = [...cheered, ...textActivities];

  const result: FeedItem[] = [];
  let ci = 0;
  let ai = 0;
  let pi = 0;

  while (ci < checkins.length || ai < activitySlot.length || pi < practices.length) {
    if (ci < checkins.length) result.push(checkins[ci++]!);
    if (ai < activitySlot.length) result.push(activitySlot[ai++]!);
    for (let i = 0; i < 3 && pi < practices.length; i++) result.push(practices[pi++]!);
    if (ci >= checkins.length && ai >= activitySlot.length && pi >= practices.length) break;
  }

  return result;
}

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

  // Feed (practice + checkin)
  const feedParams = useMemo(
    () => ({
      keyword: keyword || undefined,
      tags: filters.tags.length > 0 ? filters.tags : undefined,
    }),
    [keyword, filters]
  );

  const {
    feedItems,
    isLoading: isShowcaseLoading,
    hasMore,
    loadMore,
    isValidating,
  } = useFeed(feedParams);

  const orderedFeedItems = useMemo(() => reorderFeedItems(feedItems), [feedItems]);

  // Batch fetch reactions for all visible practices
  const practiceIds = useMemo(
    () =>
      feedItems
        .filter((item): item is Extract<FeedItem, { type: "practice" }> => item.type === "practice")
        .map((item) => item.data.id),
    [feedItems]
  );
  const {
    data: batchReactionsData,
    isLoading: isBatchReactionsLoading,
    mutate: mutateBatchReactions,
  } = useReactionsBatch({
    targetType: "practice",
    targetIds: practiceIds,
  });

  // Batch fetch reactions for all visible checkins (1 request for the whole page)
  const checkinIds = useMemo(
    () =>
      feedItems
        .filter((item): item is Extract<FeedItem, { type: "checkin" }> => item.type === "checkin")
        .map((item) => item.data.id),
    [feedItems]
  );
  const {
    data: batchCheckinReactionsData,
    isLoading: isBatchCheckinReactionsLoading,
    mutate: mutateBatchCheckinReactions,
  } = useReactionsBatch({
    targetType: "checkin",
    targetIds: checkinIds,
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

  const { inProgressTasks } = useMemo(() => {
    const practices = allPracticesData?.data || [];
    const inProgressTasksData: InProgressTask[] = [];

    practices.forEach((practice) => {
      const lastCheckInDate = practice.lastCheckinAt ?? null;
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
    });

    return { inProgressTasks: inProgressTasksData };
  }, [allPracticesData]);

  const filteredInProgressTasks = useMemo(() => {
    if (filterStatus === FilterStatus.completed)
      return inProgressTasks.filter((task) => task.status === FilterStatus.completed);
    if (filterStatus === FilterStatus.all)
      return inProgressTasks.filter((task) => task.status !== FilterStatus.completed);
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

  const hasPractices = inProgressTasks.length > 0;
  const showInProgress = true;

  const filterCounts = useMemo(
    () => ({
      [FilterStatus.all]: inProgressTasks.length,
      [FilterStatus.draft]: inProgressTasks.filter((t) => t.status === FilterStatus.draft).length,
      [FilterStatus.notStarted]: inProgressTasks.filter((t) => t.status === FilterStatus.notStarted)
        .length,
      [FilterStatus.inProgress]: inProgressTasks.filter((t) => t.status === FilterStatus.inProgress)
        .length,
      [FilterStatus.completed]: inProgressTasks.filter((t) => t.status === FilterStatus.completed)
        .length,
    }),
    [inProgressTasks]
  );

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

              {isShowcaseLoading && feedItems.length === 0 ? (
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
                  {orderedFeedItems.map((feedItem, index) => {
                    if (feedItem.type === "activity") {
                      return (
                        <ActivityCard
                          key={`activity-${index}`}
                          event_text={feedItem.event_text}
                          label={feedItem.label}
                        />
                      );
                    }

                    const isNewRelease = feedItem.feed_reason === "new_release";
                    const prevItem = index > 0 ? orderedFeedItems[index - 1] : undefined;
                    const prevFeedReason =
                      prevItem && prevItem.type !== "activity" ? prevItem.feed_reason : undefined;
                    const showFeedLabel = !isNewRelease || prevFeedReason !== "new_release";

                    if (feedItem.type === "checkin") {
                      const checkin = feedItem.data;
                      const latestActorName =
                        batchCheckinReactionsData?.data?.[checkin.id]?.items[0]?.name ??
                        batchCheckinReactionsData?.data?.[checkin.id]?.reactions.find(
                          (r) => r.count > 0
                        )?.latestActorName ??
                        checkin.reactions?.find((r) => r.latestActorName)?.latestActorName;
                      return (
                        <div key={`checkin-${checkin.id}-${feedItem.feed_reason}-${index}`}>
                          {showFeedLabel &&
                            feedItem.feed_reason &&
                            !(
                              feedItem.feed_reason === "cheered" && isBatchCheckinReactionsLoading
                            ) && (
                              <FeedLabel
                                feedReason={feedItem.feed_reason}
                                userName={checkin.user?.name}
                                practiceTitle={checkin.practice?.title}
                                latestActorName={latestActorName}
                              />
                            )}
                          <CheckInShowcaseCard
                            id={checkin.id}
                            checkin_date={checkin.checkin_date}
                            mood={checkin.mood}
                            note={checkin.note}
                            tags={checkin.tags}
                            image_urls={checkin.image_urls}
                            created_at={checkin.created_at}
                            practice={checkin.practice}
                            user={checkin.user}
                            comment_count={checkin.comment_count}
                            comment_preview={checkin.comment_preview}
                            batchReactionData={batchCheckinReactionsData?.data?.[checkin.id]}
                            onReactionMutate={() => mutateBatchCheckinReactions()}
                          />
                        </div>
                      );
                    }

                    if (feedItem.type === "practice") {
                      const practice = feedItem.data;
                      const latestActorName =
                        batchReactionsData?.data?.[practice.id]?.items[0]?.name ??
                        batchReactionsData?.data?.[practice.id]?.reactions.find((r) => r.count > 0)
                          ?.latestActorName ??
                        practice.reactions?.find((r) => r.latestActorName)?.latestActorName;
                      return (
                        <div key={`practice-${practice.id}-${feedItem.feed_reason}-${index}`}>
                          {showFeedLabel &&
                            feedItem.feed_reason &&
                            !(feedItem.feed_reason === "cheered" && isBatchReactionsLoading) && (
                              <FeedLabel
                                feedReason={feedItem.feed_reason}
                                userName={practice.user?.name}
                                latestActorName={latestActorName}
                              />
                            )}
                          {practice.is_brewing ? (
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
                          ) : (
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
                          )}
                        </div>
                      );
                    }

                    return null;
                  })}

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
                            {option.label} {filterCounts[option.value]}
                          </button>
                        ))}
                      </div>
                    </div>

                    {showInProgress && <InProgressSection tasks={filteredInProgressTasks} />}
                    <RecommendationSection onGoToInspire={() => setActiveTab("inspire")} />
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
