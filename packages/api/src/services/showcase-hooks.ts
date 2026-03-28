"use client";

/**
 * Showcase (靈感頁) API Hooks
 * - 靈感 Tab: AI backend GET /api/v1/users/practices (infinite scroll)
 * - 反應互動: Node.js backend POST /api/v1/practices/{id}/react
 *
 * NOTE: "use client" is intentionally omitted — this package is consumed by both
 * client and server components. The consumer app manages the RSC boundary.
 */

import { getRequiredEnv } from "@daodao/config";
import useSWR from "swr";
import useSWRInfinite from "swr/infinite";

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
// AI backend fetcher
// ============================================================================

export async function fetchAiBackend<T>(path: string): Promise<T> {
  const baseUrl = getRequiredEnv("NEXT_PUBLIC_AI_API_URL");
  const res = await fetch(`${baseUrl}${path}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error(`AI backend error: ${res.status}`);
  return res.json() as Promise<T>;
}

interface AIResponse<T> {
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
// Showcase Feed Hooks (AI backend, infinite scroll)
// ============================================================================

const PAGE_SIZE = 20;

const buildShowcaseQuery = (params: IShowcaseFeedParams, afterId?: string | null): string => {
  const query = new URLSearchParams();
  query.set("limit", String(params.limit ?? PAGE_SIZE));
  query.set("sort_by", params.sort_by ?? "newest_updated");
  if (afterId) query.set("after_id", afterId);
  if (params.keyword) query.set("keyword", params.keyword);
  if (params.status) query.set("status", params.status);
  if (params.duration_min != null) query.set("duration_min", String(params.duration_min));
  if (params.duration_max != null) query.set("duration_max", String(params.duration_max));
  if (params.tags && params.tags.length > 0) {
    params.tags.forEach((tag) => {
      query.append("tags[]", tag);
    });
  }
  return query.toString();
};

/**
 * Infinite scroll hook for the 靈感 (showcase) feed from AI backend.
 */
export function useShowcaseFeed(params: IShowcaseFeedParams) {
  const getKey = (pageIndex: number, previousPageData: AIResponse<IShowcasePractice[]> | null) => {
    // Stop if previous page has no next cursor
    if (previousPageData && !previousPageData.pagination?.hasNext) return null;

    const afterId = pageIndex === 0 ? null : (previousPageData?.pagination?.cursors?.end ?? null);

    const qs = buildShowcaseQuery(params, afterId);
    return `/api/v1/users/practices?${qs}`;
  };

  const { data, error, isLoading, isValidating, size, setSize } = useSWRInfinite<
    AIResponse<IShowcasePractice[]>
  >(getKey, (path: string) => fetchAiBackend<AIResponse<IShowcasePractice[]>>(path), {
    revalidateFirstPage: false,
    revalidateOnFocus: false,
  });

  const practices: IShowcasePractice[] = data?.flatMap((page) => page.data ?? []) ?? [];

  // Default to false until first page resolves to avoid spurious prefetch on mount
  const hasMore = data ? (data[data.length - 1]?.pagination?.hasNext ?? false) : false;

  const loadMore = () => setSize((s) => s + 1);

  return { practices, error, isLoading, isValidating, hasMore, loadMore, size };
}

// ============================================================================
// Search Suggestions Hook (AI backend)
// ============================================================================

export interface IShowcaseSuggestions {
  trending_keywords?: string[];
  interest_tags?: string[];
}

export function useShowcaseSuggestions(enabled: boolean) {
  return useSWR<AIResponse<IShowcaseSuggestions>>(
    enabled ? "/api/v1/users/practices/suggestions" : null,
    (path: string) => fetchAiBackend<AIResponse<IShowcaseSuggestions>>(path),
    { revalidateOnFocus: false }
  );
}

// ============================================================================
// React to Practice (Node.js backend)
// ============================================================================

/**
 * Toggle a reaction on a practice via the generic reactions endpoint.
 * - isCurrentlyReacted=false → POST /api/v1/reactions (upsert)
 * - isCurrentlyReacted=true  → DELETE /api/v1/reactions (remove)
 */
export async function reactToPractice(
  practiceId: string,
  reactionType: string,
  isCurrentlyReacted: boolean
): Promise<void> {
  const baseUrl = getRequiredEnv("NEXT_PUBLIC_API_URL");
  const res = await fetch(`${baseUrl}/api/v1/reactions`, {
    method: isCurrentlyReacted ? "DELETE" : "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(
      isCurrentlyReacted
        ? { targetType: "practice", targetId: practiceId }
        : { targetType: "practice", targetId: practiceId, reactionType }
    ),
  });
  if (!res.ok) throw new Error(`React to practice failed: ${res.status}`);
}
