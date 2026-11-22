"use client";

/** 探索活動 SWR hooks。 */

import useSWR from "swr";
import { PREFIX } from "../client";
import { apiErrorFromBody } from "../errors";
import { useQuery } from "../hooks";
import { getActivities, getActivitiesByMode, getActivityDetail } from "./activity";

/** undefined waits for auth; null is a guest; a user ID isolates personalized responses. */
type ActivityViewerType = string | null | undefined;

// ============================================================================
// Query Hooks
// ============================================================================

/** 探索活動列表（公開；登入時附 isJoined）；60 秒輪詢讓參與人數保持新鮮 */
export const useActivities = (
  mode: "sync" | "async" | "physical" | undefined,
  viewer: ActivityViewerType
) =>
  useSWR(
    viewer === undefined ? null : [PREFIX, "/api/v1/activities", viewer, mode ?? null],
    async () => {
      const result = await (mode ? getActivitiesByMode(mode) : getActivities());
      if (!result.response.ok) {
        throw apiErrorFromBody(result.response.status, result.error, "Unable to load activities");
      }
      return result.data;
    },
    {
      keepPreviousData: false,
      revalidateOnFocus: true,
      refreshInterval: 60_000,
    }
  );

/** 活動詳情；cohortId 為 null 時不發請求 */
export const useActivityDetail = (cohortId: number | null, viewer: ActivityViewerType) =>
  useSWR(
    cohortId === null || viewer === undefined
      ? null
      : [PREFIX, "/api/v1/activities/{cohortId}", viewer, cohortId],
    async () => {
      if (cohortId === null) return undefined;
      const result = await getActivityDetail(cohortId);
      if (!result.response.ok) {
        throw apiErrorFromBody(result.response.status, result.error, "Unable to load activity");
      }
      return result.data;
    },
    { keepPreviousData: false, revalidateOnFocus: true }
  );

/** 發起人快覽；userId 為 null 時不發請求 */
export const useActivityHostPreview = (userId: number | null) =>
  useQuery(
    "/api/v1/activities/hosts/{userId}",
    userId !== null ? { params: { path: { userId } } } : null
  );
