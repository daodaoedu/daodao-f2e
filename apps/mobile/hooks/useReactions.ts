import useSWR from "swr";
import { api } from "@/services/api-client";
import type { ReactionTypeType } from "@/constants/reaction-type";

// ── Types ──

interface ReactionCount {
  type: string;
  count: number;
}

interface ReactionsResponse {
  success: boolean;
  data?: {
    reactions: ReactionCount[];
    currentUserReaction: string | null;
  };
}

interface ReactionListItem {
  userId: string;
  name: string;
  photoURL?: string | null;
  reactionType: string;
  reactedAt: string;
}

interface ReactionsListResponse {
  success: boolean;
  data?: {
    items: ReactionListItem[];
  };
}

// ── Hooks ──

export function useReactions(targetType: string, targetId: string) {
  const { data, error, isLoading, mutate } = useSWR<ReactionsResponse>(
    targetId ? `/reactions?targetType=${targetType}&targetId=${targetId}` : null,
    (url: string) => api.get<ReactionsResponse>(url),
    { revalidateOnFocus: false }
  );

  const reactions = data?.data?.reactions ?? [];
  const currentUserReaction = (data?.data?.currentUserReaction ?? null) as ReactionTypeType | null;
  const totalCount = reactions.reduce((sum, r) => sum + r.count, 0);
  const displayReactions = reactions
    .filter((r) => r.count > 0)
    .map((r) => r.type as ReactionTypeType);

  return { reactions, currentUserReaction, totalCount, displayReactions, error, isLoading, mutate };
}

export function useReactionsList(targetType: string, targetId: string) {
  const { data, error, isLoading } = useSWR<ReactionsListResponse>(
    targetId ? `/reactions/list?targetType=${targetType}&targetId=${targetId}` : null,
    (url: string) => api.get<ReactionsListResponse>(url),
    { revalidateOnFocus: false }
  );

  const items = data?.data?.items ?? [];
  const firstReactorName = items[0]?.name ?? undefined;

  return { items, firstReactorName, error, isLoading };
}

// ── Mutations ──

export async function upsertReaction(targetType: string, targetId: string, reactionType: string) {
  return api.post("/reactions", { targetType, targetId, reactionType });
}

export async function removeReaction(targetType: string, targetId: string) {
  return api.delete(`/reactions?targetType=${targetType}&targetId=${targetId}`);
}
