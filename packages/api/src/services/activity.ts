/** 探索活動 API service（openspec: challenge-activity-space-wiring / activity-discovery）。 */

import { client } from "../client";
import type { paths } from "../types";

// ============================================================================
// Types
// ============================================================================

type ActivityListResponse =
  paths["/api/v1/activities"]["get"]["responses"][200]["content"]["application/json"];
export type ActivitySummaryType = ActivityListResponse["data"][number];
export type ActivityRunStatusType = ActivitySummaryType["runStatus"];
export type ActivityHostType = ActivitySummaryType["host"];
export type ActivityListMetaType = ActivityListResponse["meta"];

type ActivityDetailResponse =
  paths["/api/v1/activities/{cohortId}"]["get"]["responses"][200]["content"]["application/json"];
export type ActivityDetailType = ActivityDetailResponse["data"];

type ActivityHostPreviewResponse =
  paths["/api/v1/activities/hosts/{userId}"]["get"]["responses"][200]["content"]["application/json"];
export type ActivityHostPreviewType = ActivityHostPreviewResponse["data"];

// ============================================================================
// Client Functions
// ============================================================================

/** 探索活動列表（公開；只含組織公開、已發佈且未結束的期；登入時附 isJoined） */
export const getActivities = async () => client.GET("/api/v1/activities");

/** 依互動方式篩選探索活動列表 */
export const getActivitiesByMode = async (mode: string) =>
  client.GET("/api/v1/activities", {
    params: { query: { mode: mode as "sync" | "async" | "physical" } },
  });

/** 活動詳情（公開；已結束仍可查看） */
export const getActivityDetail = async (cohortId: number) =>
  client.GET("/api/v1/activities/{cohortId}", {
    params: { path: { cohortId } },
  });

/** 發起人快覽（公開） */
export const getActivityHostPreview = async (userId: number) =>
  client.GET("/api/v1/activities/hosts/{userId}", {
    params: { path: { userId } },
  });
