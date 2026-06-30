"use client";

/**
 * Roadmap / Wishpool API Hooks（Client Components）
 */

import { useQuery } from "../hooks";
import {
  addSupport,
  addWishSupport,
  type CreateWishBody,
  createWish,
  type GetPublicWishesParams,
  type GetRoadmapItemsParams,
  type RoadmapItemPublic,
  removeSupport,
  removeWishSupport,
} from "./roadmap";

type PublicWishesResponse = {
  data: RoadmapItemPublic[];
  pagination?: { nextCursor: string | null };
};

type UntypedQuery = (
  path: string,
  options: Record<string, unknown> | null,
  config?: { revalidateOnFocus?: boolean }
) => {
  data?: PublicWishesResponse;
  isLoading: boolean;
  error?: unknown;
  mutate: () => Promise<unknown>;
};

// ============================================================================
// Query Hooks
// ============================================================================

/** 公開看板項目（cursor 分頁；未登入可用） */
export const useRoadmapItems = (
  params: GetRoadmapItemsParams = {},
  options?: { enabled?: boolean }
) => {
  const enabled = options?.enabled ?? true;
  return useQuery(
    "/api/v1/roadmap/items",
    enabled
      ? {
          params: {
            query: {
              status: params.status,
              category: params.category,
              cursor: params.cursor,
              limit: params.limit,
            },
          },
        }
      : null,
    { revalidateOnFocus: false }
  );
};

/** Hero 統計 */
export const useRoadmapStats = (options?: { enabled?: boolean }) => {
  const enabled = options?.enabled ?? true;
  return useQuery("/api/v1/roadmap/stats", enabled ? {} : null, {
    revalidateOnFocus: false,
  });
};

export const usePublicWishes = (
  params: GetPublicWishesParams = {},
  options?: { enabled?: boolean }
) => {
  const enabled = options?.enabled ?? true;
  const useUntypedQuery = useQuery as unknown as UntypedQuery;
  return useUntypedQuery(
    "/api/v1/wishes",
    enabled
      ? {
          params: {
            query: {
              status: params.status,
              category: params.category,
              cursor: params.cursor,
              limit: params.limit,
            },
          },
        }
      : null,
    { revalidateOnFocus: false }
  );
};

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * 投票／取消投票。樂觀更新由呼叫端（卡片）就地處理；
 * 此處負責呼叫 API 並回傳最新票數，失敗則 throw 供呼叫端 rollback。
 */
export const useToggleSupport = () => {
  const isWishExternal = (externalId: string) => /^wish-/u.test(externalId);
  const toggle = async (externalId: string, currentlyVoted: boolean) => {
    const resolver = currentlyVoted
      ? isWishExternal(externalId)
        ? removeWishSupport
        : removeSupport
      : isWishExternal(externalId)
        ? addWishSupport
        : addSupport;
    const res = await resolver(externalId);
    if (res.error || !res.data) {
      throw new Error("toggle support failed");
    }
    return res.data.data;
  };
  return { toggle };
};

/** 提交許願 */
export const useCreateWish = () => {
  const create = async (body: CreateWishBody) => {
    const res = await createWish(body);
    if (res.error || !res.data) {
      throw new Error("create wish failed");
    }
    return res.data.data;
  };
  return { create };
};
