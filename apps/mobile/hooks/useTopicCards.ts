import useSWR from "swr";
import { aiApiClient } from "@/services/ai-api-client";

// 對齊 product recommendation-hooks（ai-backend）；mobile 走 aiApiClient（帶 Bearer token）
export type FeedbackType = "like" | "dislike";
export type FeedbackState = "liked" | "disliked" | "neutral";

export interface ITopicCreator {
  id: number;
  name: string;
  photo_url?: string | null;
}

export interface ITopicCard {
  practiceId: string;
  targetId: number;
  title: string;
  description?: string | null;
  creator: ITopicCreator;
  tags: string[];
  feedbackState: FeedbackState;
  isAiGenerated: boolean;
}

interface AIResponse<T> {
  success: boolean;
  data?: T;
}

export function useTopicCards(enabled: boolean, limit = 3) {
  return useSWR<ITopicCard[]>(
    enabled ? `/api/v1/recommendation/topic_cards?limit=${limit}` : null,
    async (path: string) => {
      const res = await aiApiClient<AIResponse<ITopicCard[]>>(path);
      return res.data ?? [];
    },
    { revalidateOnFocus: false }
  );
}

export async function submitTopicFeedback(
  practiceId: string,
  feedbackType: FeedbackType
): Promise<FeedbackState> {
  const res = await aiApiClient<AIResponse<{ practiceId: string; feedbackState: FeedbackState }>>(
    `/api/v1/recommendation/topic_cards/${practiceId}/feedback`,
    { method: "POST", body: JSON.stringify({ feedbackType }) }
  );
  return res.data?.feedbackState ?? "neutral";
}
