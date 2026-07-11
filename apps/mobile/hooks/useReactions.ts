import type { ReactionTargetType, ReactionTypeValue } from "@daodao/api";
import {
  extractApiErrorMessage,
  removeReaction as apiRemoveReaction,
  upsertReaction as apiUpsertReaction,
  useReactions as useApiReactions,
  useReactionsList as useApiReactionsList,
} from "@daodao/api";
import type { ReactionTypeType } from "@/constants/reaction-type";

// ── Types ──

interface ReactionCount {
  type: string;
  count: number;
  latestActorName?: string | null;
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
  const { data, error, isLoading, mutate } = useApiReactions(
    { targetType: targetType as ReactionTargetType, targetId },
    { enabled: Boolean(targetId) }
  );

  const reactions = (data as ReactionsResponse | undefined)?.data?.reactions ?? [];
  const currentUserReaction = (data?.data?.currentUserReaction ?? null) as ReactionTypeType | null;
  const totalCount = reactions.reduce((sum, r) => sum + r.count, 0);
  const displayReactions = reactions
    .filter((r) => r.count > 0)
    .map((r) => r.type as ReactionTypeType);

  return { reactions, currentUserReaction, totalCount, displayReactions, error, isLoading, mutate };
}

export function useReactionsList(targetType: string, targetId: string) {
  const { data, error, isLoading } = useApiReactionsList(
    { targetType: targetType as ReactionTargetType, targetId },
    { enabled: Boolean(targetId) }
  );

  const items = (data as ReactionsListResponse | undefined)?.data?.items ?? [];
  const firstReactorName = items[0]?.name ?? undefined;

  return { items, firstReactorName, error, isLoading };
}

// ── Mutations ──

export async function upsertReaction(targetType: string, targetId: string, reactionType: string) {
  const response = await apiUpsertReaction({
    targetType: targetType as ReactionTargetType,
    targetId,
    reactionType: reactionType as ReactionTypeValue,
  });

  if (response.error) {
    throw new Error(extractApiErrorMessage(response.error, "反應失敗"));
  }

  return response;
}

export async function removeReaction(targetType: string, targetId: string) {
  const response = await apiRemoveReaction({
    targetType: targetType as ReactionTargetType,
    targetId,
  });

  if (response.error) {
    throw new Error(extractApiErrorMessage(response.error, "取消反應失敗"));
  }

  return response;
}
