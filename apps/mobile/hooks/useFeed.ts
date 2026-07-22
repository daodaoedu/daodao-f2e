/**
 * 混合 Feed Hook — Mobile (Bearer Auth)
 * - AI backend GET /api/v1/feed (infinite scroll)
 * - 混合 practice + checkin + activity 卡片，對齊 apps/product 的 useFeed
 */

import { useEffect, useMemo, useRef } from "react";
import useSWRInfinite from "swr/infinite";
import { aiApiClient } from "@/services/ai-api-client";
import type { IReactionCountItem, IShowcasePractice } from "./useShowcaseFeed";

// ============================================================================
// Types
// ============================================================================

export type ApiMoodType = "give_up" | "frustrated" | "bored" | "neutral" | "good" | "happy";

export interface IShowcaseCheckIn {
  id: string;
  checkin_date: string;
  mood: ApiMoodType;
  note: string | null;
  tags: string[];
  image_urls: string[];
  created_at: string;
  practice: {
    id: string;
    title: string;
  };
  user?: {
    id: string;
    name: string;
    photo_url?: string | null;
    customId?: string | null;
    custom_id?: string | null;
  };
  reactions?: IReactionCountItem[];
  comment_count?: number;
  comment_preview?: {
    id: string;
    content: string;
    created_at: string;
    user?: {
      id: string;
      name: string;
      photo_url?: string | null;
      customId?: string | null;
      custom_id?: string | null;
    };
  }[];
}

export type FeedReasonType = "new_practice" | "new_release" | "checked_in" | "cheered";

export interface ActivityCardItem {
  type: "activity";
  activity_type: "community_event" | "follow_summary";
  event_type?: "reaction" | "comment";
  event_id?: string;
  event_text: string;
  label: string;
  practice_id?: string;
  checkin_id?: string;
}

export type FeedItem =
  | { type: "practice"; feed_reason: FeedReasonType; data: IShowcasePractice }
  | { type: "checkin"; feed_reason: FeedReasonType; data: IShowcaseCheckIn }
  | ActivityCardItem;

export interface IFeedParams {
  keyword?: string;
  tags?: string[];
  type?: "all" | "practice" | "checkin";
}

interface IAIFeedResponse {
  success: boolean;
  data?: FeedItem[];
  pagination?: {
    cursors?: { start?: string | null; end?: string | null } | null;
    hasNext: boolean | null;
    hasPrev: boolean | null;
    count: number | null;
  } | null;
}

// ============================================================================
// Feed reorder（1:1:1 打卡:互動:實踐，對齊 apps/product 的 reorderFeedItems）
// ============================================================================

/**
 * 規則：
 * ① 最新打卡和互動排前面（API 已依時間排序，保留 bucket 內相對順序）
 * ② 自己的互動不優先（currentUserId 的互動推後）
 * ③ 有打卡的實踐不再顯示實踐卡（同一 practice_id 只擇一）
 * ⑤ 打卡:互動:實踐 = 1:1:1
 */
export function reorderFeedItems(items: FeedItem[], currentUserId?: string | null): FeedItem[] {
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
        practices.push(item);
      }
    } else if (item.type === "activity") {
      interactions.push(item);
    }
  }

  if (currentUserId) {
    const isOwn = (item: FeedItem) =>
      (item.type === "checkin" || item.type === "practice") && item.data.user?.id === currentUserId;
    const others = interactions.filter((i) => !isOwn(i));
    const own = interactions.filter((i) => isOwn(i));
    interactions.length = 0;
    interactions.push(...others, ...own);
  }

  const result: FeedItem[] = [];
  let ci = 0;
  let ii = 0;
  let pi = 0;

  while (ci < checkins.length || ii < interactions.length || pi < practices.length) {
    if (ci < checkins.length) {
      // biome-ignore lint/style/noNonNullAssertion: bounds checked by while condition
      result.push(checkins[ci++]!);
    }
    if (ii < interactions.length) {
      // biome-ignore lint/style/noNonNullAssertion: bounds checked by while condition
      result.push(interactions[ii++]!);
    }
    if (pi < practices.length) {
      // biome-ignore lint/style/noNonNullAssertion: bounds checked by while condition
      result.push(practices[pi++]!);
    }
  }

  return result;
}

// ============================================================================
// Dedupe helper
// ============================================================================

function dedupeFeedItems(pages: IAIFeedResponse[]): FeedItem[] {
  const seen = new Set<string>();
  return pages.flatMap((page) =>
    (page.data ?? []).filter((item) => {
      const isValid = !!(item?.type && (item.type === "activity" || item.data));
      if (!isValid) return false;

      let dedupeKey: string;
      if (item.type === "activity") {
        dedupeKey = item.event_id
          ? `activity-${item.event_type}-${item.event_id}`
          : `activity-${item.activity_type}-${item.event_type ?? "none"}-${item.event_text}`;
      } else if (item.type === "checkin") {
        dedupeKey = `checkin-${item.data.id}-${item.feed_reason}`;
      } else {
        dedupeKey = `practice-${item.data.id}-${item.feed_reason}`;
      }

      if (seen.has(dedupeKey)) return false;
      seen.add(dedupeKey);
      return true;
    })
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useFeed(params: IFeedParams) {
  const getKey = (pageIndex: number, previousPageData: IAIFeedResponse | null) => {
    if (previousPageData && !previousPageData.pagination?.hasNext) return null;

    const query = new URLSearchParams();
    if (params.keyword) query.set("keyword", params.keyword);
    if (params.tags?.length) {
      for (const tag of params.tags) query.append("tags", tag);
    }
    if (params.type && params.type !== "all") {
      query.set("type", params.type);
    }
    if (pageIndex > 0 && previousPageData?.pagination?.cursors?.end) {
      query.set("cursor", previousPageData.pagination.cursors.end);
    }

    const qs = query.toString();
    return `/api/v1/feed${qs ? `?${qs}` : ""}`;
  };

  const { data, error, size, setSize, isLoading, isValidating, mutate } =
    useSWRInfinite<IAIFeedResponse>(getKey, (path: string) => aiApiClient<IAIFeedResponse>(path), {
      revalidateFirstPage: false,
      revalidateOnFocus: false,
    });

  const paramsKey = JSON.stringify(params);
  const prevParamsKey = useRef(paramsKey);
  useEffect(() => {
    if (prevParamsKey.current !== paramsKey) {
      prevParamsKey.current = paramsKey;
      setSize(1);
    }
  }, [paramsKey, setSize]);

  const feedItems: FeedItem[] = useMemo(() => (data ? dedupeFeedItems(data) : []), [data]);

  const hasMore = data ? (data[data.length - 1]?.pagination?.hasNext ?? false) : false;
  const loadMore = () => setSize((currentSize) => currentSize + 1);

  return { feedItems, error, isLoading, isValidating, hasMore, loadMore, size, mutate };
}
