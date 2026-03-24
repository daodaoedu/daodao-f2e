/**
 * Showcase (靈感頁) Feed Hook — Mobile (Bearer Auth)
 * - AI backend GET /api/v1/users/practices (infinite scroll)
 * - Uses apiClient with Bearer token auth instead of cookie-based fetchAiBackend
 */

import { useEffect, useRef } from "react";
import useSWRInfinite from "swr/infinite";
import { apiClient } from "@/services/api-client";

const AI_API_URL =
  process.env.EXPO_PUBLIC_AI_API_URL ?? "https://ai-dev.daodao.so";

// ============================================================================
// Types
// ============================================================================

export interface IReactionCountItem {
  type: string;
  count: number;
  latestActorName?: string;
}

export interface IShowcasePractice {
  id: string;
  title: string;
  status: "active" | "completed";
  privacy_status: "public" | "delayed";
  is_brewing?: boolean;
  start_date?: string | null;
  end_date?: string | null;
  practice_action?: string | null;
  user?: {
    id: string;
    name: string;
    photo_url?: string | null;
  };
  frequency_min_days?: number | null;
  frequency_max_days?: number | null;
  session_duration_minutes?: number | null;
  reactions?: IReactionCountItem[];
  comment_count?: number;
  last_checkin_summary?: string | null;
}

export interface IShowcaseFeedParams {
  keyword?: string;
  tags?: string[];
  duration_min?: number;
  duration_max?: number;
  status?: "active" | "completed";
  sort_by?: string;
  limit?: number;
}

// ============================================================================
// Internal types
// ============================================================================

interface IAIResponse<T> {
  success: boolean;
  data?: T;
  pagination?: {
    cursors?: { start?: string | null; end?: string | null } | null;
    hasNext: boolean | null;
    hasPrev: boolean | null;
    count: number | null;
  } | null;
}

// ============================================================================
// Query builder
// ============================================================================

const PAGE_SIZE = 20;

const buildShowcaseQuery = (
  params: IShowcaseFeedParams,
  afterId?: string | null
): string => {
  const query = new URLSearchParams();
  query.set("limit", String(params.limit ?? PAGE_SIZE));
  query.set("sort_by", params.sort_by ?? "newest_updated");
  if (afterId) query.set("after_id", afterId);
  if (params.keyword) query.set("keyword", params.keyword);
  if (params.status) query.set("status", params.status);
  if (params.duration_min != null)
    query.set("duration_min", String(params.duration_min));
  if (params.duration_max != null)
    query.set("duration_max", String(params.duration_max));
  if (params.tags && params.tags.length > 0) {
    params.tags.forEach((tag) => { query.append("tags[]", tag); });
  }
  return query.toString();
};

// ============================================================================
// Showcase Feed Hook (AI backend, infinite scroll)
// ============================================================================

/**
 * Infinite scroll hook for the 靈感 (showcase) feed from AI backend.
 * Uses Bearer token auth via apiClient.
 */
export function useShowcaseFeed(params: IShowcaseFeedParams) {
  const getKey = (
    pageIndex: number,
    previousPageData: IAIResponse<IShowcasePractice[]> | null
  ) => {
    // Stop if previous page has no next cursor
    if (previousPageData && !previousPageData.pagination?.hasNext) return null;

    const afterId =
      pageIndex === 0
        ? null
        : (previousPageData?.pagination?.cursors?.end ?? null);

    const qs = buildShowcaseQuery(params, afterId);
    return `${AI_API_URL}/api/v1/users/practices?${qs}`;
  };

  const { data, error, isLoading, isValidating, size, setSize, mutate } =
    useSWRInfinite<IAIResponse<IShowcasePractice[]>>(
      getKey,
      (url: string) => apiClient<IAIResponse<IShowcasePractice[]>>(url),
      {
        revalidateFirstPage: false,
        revalidateOnFocus: false,
      }
    );

  // Reset to page 1 when params change to avoid stale cursors
  const paramsKey = JSON.stringify(params);
  const prevParamsKey = useRef(paramsKey);
  useEffect(() => {
    if (prevParamsKey.current !== paramsKey) {
      prevParamsKey.current = paramsKey;
      setSize(1);
    }
  }, [paramsKey, setSize]);

  const practices: IShowcasePractice[] =
    data?.flatMap((page) => page.data ?? []) ?? [];

  // Default to false until first page resolves to avoid spurious prefetch on mount
  const hasMore = data
    ? (data[data.length - 1]?.pagination?.hasNext ?? false)
    : false;

  const loadMore = () => setSize((s) => s + 1);

  return { practices, error, isLoading, isValidating, hasMore, loadMore, size, mutate };
}
