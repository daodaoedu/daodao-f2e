/** 共同挑戰 API service（openspec: group-challenge）。 */

import { client } from "../client";
import type { paths } from "../types";

// ============================================================================
// Types
// ============================================================================

type ChallengeListResponse =
  paths["/api/v1/challenges"]["get"]["responses"][200]["content"]["application/json"];
type ChallengeDetailResponse =
  paths["/api/v1/challenges/{challengeId}"]["get"]["responses"][200]["content"]["application/json"];
type ChallengeJoinResponse =
  paths["/api/v1/challenges/{challengeId}/join"]["post"]["responses"][201]["content"]["application/json"];
type TodayDrawsResponse =
  paths["/api/v1/challenges/{challengeId}/draws/today"]["get"]["responses"][200]["content"]["application/json"];
type MyChallengesResponse =
  paths["/api/v1/me/challenges"]["get"]["responses"][200]["content"]["application/json"];
type DrawResponse =
  paths["/api/v1/challenges/{challengeId}/draws"]["post"]["responses"][201]["content"]["application/json"];

export type ChallengeSummaryType = ChallengeListResponse["data"][number];
export type ChallengeDetailType = ChallengeDetailResponse["data"];
export type ChallengeJoinResultType = ChallengeJoinResponse["data"];
export type ChallengeTodayDrawsType = TodayDrawsResponse["data"];
export type ChallengeDrawResultType = DrawResponse["data"];
export type ChallengeRunStatusType = ChallengeSummaryType["runStatus"];
export type MyChallengeType = MyChallengesResponse["data"][number];

// ============================================================================
// Client Functions
// ============================================================================

/** 探索共同挑戰列表（公開；登入時附 isJoined） */
export const getChallenges = async () => client.GET("/api/v1/challenges");

/** 我參加的共同挑戰（含已結束），附自動複製的實踐 id */
export const getMyChallenges = async () => client.GET("/api/v1/me/challenges");

/** 挑戰詳情（公開，含已結束的歷史足跡） */
export const getChallenge = async (challengeId: number) =>
  client.GET("/api/v1/challenges/{challengeId}", {
    params: { path: { challengeId } },
  });

/** 加入共同挑戰（自動複製綁定模板為個人實踐） */
export const joinChallenge = async (challengeId: number) =>
  client.POST("/api/v1/challenges/{challengeId}/join", {
    params: { path: { challengeId } },
  });

/** 今日抽卡現況（僅參與者） */
export const getTodayDraws = async (challengeId: number) =>
  client.GET("/api/v1/challenges/{challengeId}/draws/today", {
    params: { path: { challengeId } },
  });

/** 抽一張靈感卡（每日上限 3 次） */
export const drawInspirationCard = async (challengeId: number) =>
  client.POST("/api/v1/challenges/{challengeId}/draws", {
    params: { path: { challengeId } },
  });

/** 選定今日使用的卡片（同日僅一張，可重選） */
export const selectInspirationDraw = async (challengeId: number, drawId: number) =>
  client.POST("/api/v1/challenges/{challengeId}/draws/{drawId}/select", {
    params: { path: { challengeId, drawId } },
  });
