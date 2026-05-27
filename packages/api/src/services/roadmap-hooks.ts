"use client";

/**
 * Roadmap / Wishpool API Hooks（Client Components）
 */

import { useQuery } from "../hooks";
import {
  addSupport,
  type CreateWishBody,
  createWish,
  type GetRoadmapItemsParams,
  removeSupport,
} from "./roadmap";

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

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * 投票／取消投票。樂觀更新由呼叫端（卡片）就地處理；
 * 此處負責呼叫 API 並回傳最新票數，失敗則 throw 供呼叫端 rollback。
 */
export const useToggleSupport = () => {
  const toggle = async (externalId: string, currentlyVoted: boolean) => {
    const res = currentlyVoted ? await removeSupport(externalId) : await addSupport(externalId);
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
