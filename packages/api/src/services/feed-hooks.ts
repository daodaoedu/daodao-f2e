"use client";

/**
 * Feed API Hooks
 * - 統一 Feed: AI backend GET /api/v1/feed (infinite scroll)
 * - 混合 practice + checkin 卡片
 */

import { getEnv } from "@daodao/config";
import { useCallback, useMemo } from "react";
import useSWRInfinite from "swr/infinite";
import type { IReactionCountItem, IShowcasePractice } from "./showcase-hooks";
import { fetchAiBackend } from "./showcase-hooks";

// ============================================================================
// Types
// ============================================================================

export type ApiMoodType = "give_up" | "frustrated" | "bored" | "neutral" | "good" | "happy";

export interface IShowcaseCheckIn {
  id: string;
  checkin_date: string;
  mood: ApiMoodType;
  note: string;
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

// ============================================================================
// AI backend response shape
// ============================================================================

interface AIFeedResponse {
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
// Hook
// ============================================================================

export function useFeed(params: IFeedParams) {
  const getKey = (pageIndex: number, previousPageData: AIFeedResponse | null) => {
    if (previousPageData && !previousPageData.pagination?.hasNext) return null;

    const searchParams = new URLSearchParams();
    if (params.keyword) searchParams.set("keyword", params.keyword);
    if (params.tags?.length) {
      for (const tag of params.tags) searchParams.append("tags", tag);
    }
    if (params.type && params.type !== "all") {
      searchParams.set("type", params.type);
    }
    if (pageIndex > 0 && previousPageData?.pagination?.cursors?.end) {
      searchParams.set("cursor", previousPageData.pagination.cursors.end);
    }

    const qs = searchParams.toString();
    return `/api/v1/feed${qs ? `?${qs}` : ""}`;
  };

  const { data, error, size, setSize, isLoading, isValidating } = useSWRInfinite<AIFeedResponse>(
    getKey,
    (path: string) => fetchAiBackend<AIFeedResponse>(path),
    { revalidateFirstPage: false }
  );

  const feedItems: FeedItem[] = useMemo(() => {
    if (!data) return [];
    const seen = new Set<string>();
    return data.flatMap((page) =>
      (page.data ?? []).filter((item) => {
        const isValid = !!(item?.type && (item?.type === "activity" || item?.data));
        if (!isValid && getEnv("NODE_ENV") !== "production") {
          console.warn("[useFeed] Malformed feed item (missing type/data):", item);
        }
        if (!isValid) return false;

        let dedupeKey: string;
        if (item.type === "activity") {
          if (!item.event_id) return true;
          dedupeKey = `activity-${item.event_type}-${item.event_id}`;
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
  }, [data]);

  const hasMore = data ? (data[data.length - 1]?.pagination?.hasNext ?? false) : false;

  const loadMore = useCallback(() => setSize((currentSize) => currentSize + 1), [setSize]);

  return {
    feedItems,
    error,
    isLoading,
    isValidating,
    hasMore,
    loadMore,
    size,
  };
}
