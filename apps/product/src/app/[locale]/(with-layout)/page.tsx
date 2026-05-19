"use client";

import {
  type ActivityCardItem,
  type FeedItem,
  useFeed,
  useReactionsBatch,
} from "@daodao/api";
import { useRouter, useSearchParams } from "@daodao/i18n/navigation";
import { getStorage, StorageEnum } from "@daodao/shared";
import { cn } from "@daodao/ui/lib/utils";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AddTaskFAB } from "@/components/dashboard";
import { BackgroundAnimation, Banner } from "@/components/layout";
import { ResonanceCarousel } from "@/components/persona";
import {
  ActivityCard,
  BrewingCard,
  CheckInShowcaseCard,
  FeedLabel,
  PracticeShowcaseCard,
  type ShowcaseFilterState,
  ShowcaseSearchBar,
} from "@/components/showcase";
import { HOME_TAB_PATHS } from "@/constants/home-navigation";

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

  const activitySlot: FeedItem[] = [...cheered, ...textActivities];

  const result: FeedItem[] = [];
  let ci = 0;
  let ai = 0;
  let pi = 0;

  while (ci < checkins.length || ai < activitySlot.length || pi < practices.length) {
    if (ci < checkins.length) {
      const checkin = checkins[ci];
      if (checkin) result.push(checkin);
      ci++;
    }
    if (ai < activitySlot.length) {
      const activity = activitySlot[ai];
      if (activity) result.push(activity);
      ai++;
    }
    for (let i = 0; i < 3 && pi < practices.length; i++) {
      const practice = practices[pi];
      if (practice) result.push(practice);
      pi++;
    }
    if (ci >= checkins.length && ai >= activitySlot.length && pi >= practices.length) break;
  }

  return result;
}

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchValue, setSearchValue] = useState(searchParams.get("keyword") ?? "");
  const [filters, _setFilters] = useState<ShowcaseFilterState>({
    tags: searchParams.getAll("tags[]"),
  });
  const [keyword, setKeyword] = useState(searchParams.get("keyword") ?? "");

  const updateUrlParams = useCallback(
    (kw: string, f: ShowcaseFilterState) => {
      const params = new URLSearchParams();
      if (kw) params.set("keyword", kw);
      for (const tag of f.tags) {
        params.append("tags[]", tag);
      }
      const qs = params.toString();
      router.replace(qs ? `?${qs}` : HOME_TAB_PATHS.inspire, { scroll: false });
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

  const feedAnchorStorageRef = useRef(getStorage<string>(StorageEnum.HomeFeedAnchor));
  const feedRestoredRef = useRef(false);

  const handleFeedClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = (e.target as HTMLElement).closest("[data-feed-id]");
    const id = card?.getAttribute("data-feed-id");
    if (id) feedAnchorStorageRef.current.set(id);
  };

  useEffect(() => {
    if (feedRestoredRef.current || orderedFeedItems.length === 0) return;
    const storage = feedAnchorStorageRef.current;
    const anchor = storage.get();
    if (!anchor) {
      feedRestoredRef.current = true;
      return;
    }
    const element = document.querySelector(`[data-feed-id="${CSS.escape(anchor)}"]`);
    if (element) {
      element.scrollIntoView({ block: "center", behavior: "instant" });
      storage.remove();
      feedRestoredRef.current = true;
      return;
    }
    if (!hasMore) {
      storage.remove();
      feedRestoredRef.current = true;
      return;
    }
    loadMore();
  }, [orderedFeedItems, hasMore, loadMore]);

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
              className={cn(
                "flex-1 py-2 text-sm font-medium transition-all",
                "text-text-dark border-b-2 border-logo-cyan -mb-px"
              )}
            >
              靈感
            </button>
            <button
              type="button"
              onClick={() => router.replace(HOME_TAB_PATHS.mine)}
              className={cn(
                "flex-1 py-2 text-sm font-medium transition-all",
                "text-text-dark/40"
              )}
            >
              我的
            </button>
          </div>

          {/* 靈感 Tab */}
          <div className="mt-[60px] mb-[48px]">
            <ShowcaseSearchBar
              value={searchValue}
              onChange={setSearchValue}
              onSearch={handleSearch}
            />
          </div>

          <ResonanceCarousel />

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
            <div className="flex flex-col gap-3" onClickCapture={handleFeedClickCapture}>
              {orderedFeedItems.map((feedItem, index) => {
                if (feedItem.type === "activity") {
                  const canOpenActivity = !!feedItem.practice_id && !!feedItem.checkin_id;
                  const activityKey = `activity-${feedItem.event_type ?? "event"}-${feedItem.event_id || index}`;
                  return (
                    <div key={activityKey} data-feed-id={activityKey}>
                      <ActivityCard
                        event_text={feedItem.event_text}
                        label={feedItem.label}
                        onClick={
                          canOpenActivity
                            ? () =>
                                router.push(
                                  `/practices/${feedItem.practice_id}/check-ins/${feedItem.checkin_id}`
                                )
                            : undefined
                        }
                      />
                    </div>
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
                    <div
                      key={`checkin-${checkin.id}-${feedItem.feed_reason}-${index}`}
                      data-feed-id={`checkin-${checkin.id}`}
                    >
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
                    <div
                      key={`practice-${practice.id}-${feedItem.feed_reason}-${index}`}
                      data-feed-id={`practice-${practice.id}`}
                    >
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
        </div>
      </main>

      <AddTaskFAB onAddTask={() => router.push("/practices/create")} />
    </div>
  );
}
