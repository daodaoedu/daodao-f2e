"use client";

import {
  type ActivityCardItem,
  type FeedItem,
  useFeed,
  useMySpaces,
  useReactionsBatch,
} from "@daodao/api";
import { useAuth } from "@daodao/auth";
import { useTranslations } from "@daodao/i18n";
import { useRouter, useSearchParams } from "@daodao/i18n/navigation";
import { getStorage, StorageEnum } from "@daodao/shared";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AddTaskFAB,
  buildHomeFeedQuery,
  buildSpaceFilterOptions,
  ExploreRow,
  FeedSpaceFilter,
  parseSpaceFilterParams,
  SPACE_FILTER_PARAM,
  type SpaceFilterValue,
  sanitizeSpaceSelection,
  YourToday,
} from "@/components/dashboard";
import { HomeTimelineSummary } from "@/components/future-letter";
import { BackgroundAnimation, Banner } from "@/components/layout";
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

// Reorder feed items into the cycle: [打卡] → [互動] → [實踐] → repeat (1:1:1)
// 規則：
// ① 最新打卡和互動排前面（API 已依時間排序，保留 bucket 內相對順序）
// ② 自己的互動不優先（currentUserId 的互動推後）
// ③ 有打卡的實踐不再顯示實踐卡（同一 practice_id 只擇一）
// ⑤ 打卡:互動:實踐 = 1:1:1
function reorderFeedItems(items: FeedItem[], currentUserId?: string | null): FeedItem[] {
  // Rule ③: 蒐集有打卡的 practice_id
  const practiceIdsWithCheckins = new Set<string>();
  for (const item of items) {
    if (item.type === "checkin") {
      practiceIdsWithCheckins.add(item.data.practice.id);
    }
  }

  const checkins: Extract<FeedItem, { type: "checkin" }>[] = [];
  const interactions: FeedItem[] = [];
  const practices: Extract<FeedItem, { type: "practice" }>[] = [];

  for (const item of items) {
    if (item.type === "checkin") {
      if (item.feed_reason === "cheered") {
        interactions.push(item);
      } else {
        checkins.push(item);
      }
    } else if (item.type === "practice") {
      if (item.feed_reason === "cheered") {
        interactions.push(item);
      } else if (!practiceIdsWithCheckins.has(item.data.id)) {
        // Rule ③: 有打卡紀錄的實踐不出現實踐卡
        practices.push(item);
      }
    } else if (item.type === "activity") {
      interactions.push(item as ActivityCardItem);
    }
  }

  // Rule ②: 自己的互動推到後面
  if (currentUserId) {
    const isOwn = (item: FeedItem) =>
      (item.type === "checkin" || item.type === "practice") && item.data.user?.id === currentUserId;
    const others = interactions.filter((i) => !isOwn(i));
    const own = interactions.filter((i) => isOwn(i));
    interactions.length = 0;
    interactions.push(...others, ...own);
  }

  // Rule ⑤: 1:1:1 cycle
  const result: FeedItem[] = [];
  let ci = 0;
  let ii = 0;
  let pi = 0;

  while (ci < checkins.length || ii < interactions.length || pi < practices.length) {
    if (ci < checkins.length) {
      result.push(checkins[ci++]!);
    }
    if (ii < interactions.length) {
      result.push(interactions[ii++]!);
    }
    if (pi < practices.length) {
      result.push(practices[pi++]!);
    }
  }

  return result;
}

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("dashboard");
  const { user, isLoading: isAuthLoading } = useAuth();

  const [searchValue, setSearchValue] = useState(searchParams.get("keyword") ?? "");
  const [filters, _setFilters] = useState<ShowcaseFilterState>({
    tags: searchParams.getAll("tags[]"),
  });
  const [keyword, setKeyword] = useState(searchParams.get("keyword") ?? "");
  const [spaceFilters, setSpaceFilters] = useState<SpaceFilterValue[]>(() =>
    parseSpaceFilterParams(searchParams.getAll(SPACE_FILTER_PARAM))
  );

  const { data: mySpacesData, isLoading: isMySpacesLoading } = useMySpaces(!!user);
  const spaceFilterOptions = useMemo(
    () => buildSpaceFilterOptions(user ? mySpacesData?.data?.items : undefined),
    [user, mySpacesData]
  );
  const isSpaceFilterOptionsReady =
    !isAuthLoading && (!user || (!isMySpacesLoading && !!mySpacesData));

  // Redirect legacy `/?tab=mine` URLs (old bookmarks/history) to the dedicated /mine route.
  useEffect(() => {
    if (searchParams.get("tab") !== "mine") return;
    const params = new URLSearchParams(searchParams.toString());
    params.delete("tab");
    const qs = params.toString();
    router.replace(qs ? `${HOME_TAB_PATHS.mine}?${qs}` : HOME_TAB_PATHS.mine);
  }, [searchParams, router]);

  const updateUrlParams = useCallback(
    (kw: string, f: ShowcaseFilterState, spaces: SpaceFilterValue[]) => {
      const qs = buildHomeFeedQuery({ keyword: kw, tags: f.tags, spaces });
      router.replace(qs ? `?${qs}` : HOME_TAB_PATHS.inspire, { scroll: false });
    },
    [router]
  );

  const handleSearch = useCallback(
    (value: string) => {
      setKeyword(value);
      updateUrlParams(value, filters, spaceFilters);
    },
    [filters, spaceFilters, updateUrlParams]
  );

  const handleSpaceFilterChange = useCallback(
    (next: SpaceFilterValue[]) => {
      setSpaceFilters(next);
      updateUrlParams(keyword, filters, next);
    },
    [keyword, filters, updateUrlParams]
  );

  // 網址帶著已不再參與（或未登入看不到）的活動課程時，選項載入後移除
  useEffect(() => {
    if (!isSpaceFilterOptionsReady) return;
    const sanitized = sanitizeSpaceSelection(spaceFilters, spaceFilterOptions);
    if (sanitized.length !== spaceFilters.length) handleSpaceFilterChange(sanitized);
  }, [isSpaceFilterOptionsReady, spaceFilterOptions, spaceFilters, handleSpaceFilterChange]);

  const feedParams = useMemo(
    () => ({
      keyword: keyword || undefined,
      tags: filters.tags.length > 0 ? filters.tags : undefined,
      spaces: spaceFilters.length > 0 ? spaceFilters : undefined,
    }),
    [keyword, filters, spaceFilters]
  );

  const {
    feedItems,
    error: feedError,
    isLoading: isShowcaseLoading,
    hasMore,
    loadMore,
    isValidating,
  } = useFeed(feedParams);

  const orderedFeedItems = useMemo(
    () => reorderFeedItems(feedItems, user?.id),
    [feedItems, user?.id]
  );

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
      {user && <HomeTimelineSummary />}
      <BackgroundAnimation />

      <main className="relative z-[25] pb-[72px] bg-very-light-gray">
        <div className="max-w-[640px] px-4 mx-auto pt-4">
          {/* 你的今天 */}
          <YourToday />

          {/* 探索列 */}
          <ExploreRow />

          {/* 搜尋 + 篩選 */}
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <ShowcaseSearchBar
              value={searchValue}
              onChange={setSearchValue}
              onSearch={handleSearch}
            />
            <div className="flex min-w-0 items-center gap-2">
              <span aria-hidden="true" className="h-4 w-px bg-[oklch(0.891_0_89.9)]" />
              <FeedSpaceFilter
                options={spaceFilterOptions}
                selected={spaceFilters}
                onChange={handleSpaceFilterChange}
              />
            </div>
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
            <div className="flex flex-col gap-3" onClickCapture={handleFeedClickCapture}>
              {orderedFeedItems.map((feedItem, index) => {
                if (feedItem.type === "activity") {
                  const canOpenActivity = !!feedItem.practice_id && !!feedItem.checkin_id;
                  const activityKey = `activity-${feedItem.event_type ?? "event"}-${feedItem.event_id ?? index}-${index}`;
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
                      key={`checkin-${checkin.id}-${feedItem.feed_reason}`}
                      data-feed-id={`checkin-${checkin.id}`}
                    >
                      {showFeedLabel &&
                        feedItem.feed_reason &&
                        !(feedItem.feed_reason === "cheered" && isBatchCheckinReactionsLoading) && (
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
                      key={`practice-${practice.id}-${feedItem.feed_reason}`}
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
                                  customId: practice.user.custom_id,
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
                                  customId: practice.user.custom_id,
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

              {spaceFilters.length > 0 &&
                !isShowcaseLoading &&
                !feedError &&
                orderedFeedItems.length === 0 && (
                  <p className="m-0 py-12 text-center text-sm text-text-dark/50">
                    {t("feed_space_filter_empty")}
                  </p>
                )}

              <div ref={sentinelRef} className="h-4" />

              {isValidating && (
                <div className="text-center py-4 text-text-dark/50 text-sm">{t("loading")}</div>
              )}
            </div>
          )}
        </div>
      </main>

      <AddTaskFAB />
    </div>
  );
}
