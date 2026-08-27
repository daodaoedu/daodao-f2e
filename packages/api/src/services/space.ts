/** Space API service (issue #151 空間頁面). */

import { client } from "../client";
import type { components, paths } from "../types";

// ============================================================================
// Types
// ============================================================================

export type SpaceListItemType = components["schemas"]["SpaceListItem"];
export type SpaceDetailType = components["schemas"]["SpaceDetail"];
export type SpaceMemberType = components["schemas"]["SpaceMember"];
export type SpacePracticeCardType = components["schemas"]["SpacePracticeCard"];
export type SpaceHomePageType = components["schemas"]["SpaceHomePage"];
export type SpaceBlockType = components["schemas"]["SpaceBlock"];
export type CreateSpaceHomePageRequestType = components["schemas"]["CreateSpaceHomePage"];
export type CreateSpaceBlockRequestType = components["schemas"]["CreateSpaceBlock"];
export type UpdateSpaceBlockRequestType = components["schemas"]["UpdateSpaceBlock"];
export type MoveSpaceBlockRequestType = components["schemas"]["MoveSpaceBlock"];
export type PublishSpaceBlockRequestType = components["schemas"]["PublishSpaceBlock"];
export type SpaceListResponseType =
  paths["/api/v1/spaces"]["get"]["responses"][200]["content"]["application/json"];

// ============================================================================
// Client Functions
// ============================================================================

export const getMySpaces = async () => client.GET("/api/v1/spaces");

export const getSpaceDetail = async (id: string) =>
  client.GET("/api/v1/spaces/{id}", { params: { path: { id } } });

export const getSpaceMembers = async (id: string) =>
  client.GET("/api/v1/spaces/{id}/members", { params: { path: { id } } });

export const getSpacePractices = async (id: string) =>
  client.GET("/api/v1/spaces/{id}/practices", { params: { path: { id } } });

export const getSpaceHomePage = async (id: string) =>
  client.GET("/api/v1/spaces/{id}/home-page", { params: { path: { id } } });

export const createSpaceHomePage = async (id: string, data: CreateSpaceHomePageRequestType) =>
  client.POST("/api/v1/spaces/{id}/home-page", { params: { path: { id } }, body: data });

export const publishSpaceHomePage = async (id: string) =>
  client.POST("/api/v1/spaces/{id}/home-page/publish", { params: { path: { id } } });

export const createSpaceBlock = async (id: string, data: CreateSpaceBlockRequestType) =>
  client.POST("/api/v1/spaces/{id}/blocks", { params: { path: { id } }, body: data });

export const updateSpaceBlock = async (
  id: string,
  blockId: number,
  data: UpdateSpaceBlockRequestType
) =>
  client.PATCH("/api/v1/spaces/{id}/blocks/{blockId}", {
    params: { path: { id, blockId } },
    body: data,
  });

export const moveSpaceBlock = async (
  id: string,
  blockId: number,
  data: MoveSpaceBlockRequestType
) =>
  client.POST("/api/v1/spaces/{id}/blocks/{blockId}/move", {
    params: { path: { id, blockId } },
    body: data,
  });

export const publishSpaceBlock = async (
  id: string,
  blockId: number,
  data: PublishSpaceBlockRequestType = {}
) =>
  client.POST("/api/v1/spaces/{id}/blocks/{blockId}/publish", {
    params: { path: { id, blockId } },
    body: data,
  });

export const draftSpaceBlock = async (id: string, blockId: number) =>
  client.POST("/api/v1/spaces/{id}/blocks/{blockId}/draft", { params: { path: { id, blockId } } });

export const getPublicSpace = async (token: string) =>
  client.GET("/api/v1/spaces/public/{token}", { params: { path: { token } } });

export const deleteSpaceBlock = async (id: string, blockId: number) =>
  client.DELETE("/api/v1/spaces/{id}/blocks/{blockId}", { params: { path: { id, blockId } } });
