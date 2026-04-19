"use client";

import { getRequiredEnv } from "@daodao/config";
import useSWR from "swr";
import { fetchAiBackend } from "./showcase-hooks";

// ============================================================================
// Types
// ============================================================================

export type FeedbackType = "like" | "dislike";
export type FeedbackState = "liked" | "disliked" | "neutral";
export type MatchReasonCode =
  | "ongoing_practice"
  | "tag_match"
  | "professional_field"
  | "popular_content";

export interface IRecommendationCreator {
  id: number;
  name: string;
  photo_url?: string | null;
}

export interface ITopicCard {
  practiceId: string;
  targetId: number;
  title: string;
  description?: string | null;
  creator: IRecommendationCreator;
  tags: string[];
  matchReasonCode: MatchReasonCode;
  matchReasonText: string;
  feedbackState: FeedbackState;
  isAiGenerated: boolean;
}

interface AIResponse<T> {
  success: boolean;
  data?: T;
}

// ============================================================================
// GET topic_cards hook
// ============================================================================

export interface ITopicCardsParams {
  limit?: number;
  excludeIds?: number[];
  enabled?: boolean;
}

export function useTopicRecommendations({ limit = 3, excludeIds = [], enabled = true }: ITopicCardsParams = {}) {
  const qs = new URLSearchParams();
  qs.set("limit", String(limit));
  for (const id of excludeIds) {
    qs.append("exclude_ids", String(id));
  }
  const path = `/api/v1/recommendation/topic_cards?${qs.toString()}`;

  const { data, error, isLoading, mutate } = useSWR<AIResponse<ITopicCard[]>>(
    enabled ? path : null,
    (p: string) => fetchAiBackend<AIResponse<ITopicCard[]>>(p),
    { revalidateOnFocus: false }
  );

  return {
    cards: data?.data ?? [],
    isLoading,
    error,
    mutate,
  };
}

// ============================================================================
// POST feedback mutation
// ============================================================================

export async function submitRecommendationFeedback(
  practiceId: string,
  feedbackType: FeedbackType
): Promise<FeedbackState> {
  const baseUrl = getRequiredEnv("NEXT_PUBLIC_AI_API_URL").replace(/\/$/, "");
  const res = await fetch(
    `${baseUrl}/api/v1/recommendation/topic_cards/${practiceId}/feedback`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feedbackType }),
    }
  );
  if (!res.ok) throw new Error(`Feedback failed: ${res.status}`);
  const json = (await res.json()) as AIResponse<{ practiceId: string; feedbackState: FeedbackState }>;
  return json.data?.feedbackState ?? "neutral";
}
