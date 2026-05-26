/**
 * Roadmap / Wishpool API Service
 * 許願池公開看板、投票、許願提交的 API 調用函數
 */

import { client } from "../client";
import type { components, paths } from "../types";

// ============================================================================
// Types
// ============================================================================

export type RoadmapItemPublic = components["schemas"]["RoadmapItemPublic"];
export type RoadmapStats = components["schemas"]["RoadmapStats"];
export type ToggleSupportResult = components["schemas"]["ToggleSupportResult"];
export type CreateWishBody = components["schemas"]["CreateWish"];

type ListQuery = NonNullable<paths["/api/v1/roadmap/items"]["get"]["parameters"]["query"]>;
export type BoardTab = NonNullable<ListQuery["status"]>;
export type RoadmapCategory = NonNullable<ListQuery["category"]>;
export type RoadmapStatus = RoadmapItemPublic["status"];

export interface GetRoadmapItemsParams {
  status?: BoardTab;
  category?: RoadmapCategory;
  cursor?: string;
  limit?: number;
}

// ============================================================================
// Client Functions
// ============================================================================

export const getRoadmapItems = async (params: GetRoadmapItemsParams = {}) =>
  client.GET("/api/v1/roadmap/items", {
    params: {
      query: {
        status: params.status,
        category: params.category,
        cursor: params.cursor,
        limit: params.limit,
      },
    },
  });

export const getRoadmapStats = async () => client.GET("/api/v1/roadmap/stats", {});

export const addSupport = async (externalId: string) =>
  client.POST("/api/v1/roadmap/items/{externalId}/supports", {
    params: { path: { externalId } },
  });

export const removeSupport = async (externalId: string) =>
  client.DELETE("/api/v1/roadmap/items/{externalId}/supports", {
    params: { path: { externalId } },
  });

export const createWish = async (body: CreateWishBody) => client.POST("/api/v1/wishes", { body });
