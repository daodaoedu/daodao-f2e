import type { ChallengeSummaryType } from "@daodao/api";
import { type ChallengeCardAction, getChallengeCardAction } from "@/utils/challenge-card";

type ChallengeLinkInput = Pick<
  ChallengeSummaryType,
  "id" | "isJoined" | "canJoin" | "unavailableReason" | "runStatus"
>;

/**
 * FR-CC-20（daodao#570，待 PM 確認）：已加入的人在探索頁點卡片，也先到介紹頁。
 * PM 不同意時改成 false，已加入且有實踐連結的卡片就回到直接進實踐頁。
 */
export const JOINED_EXPLORE_CARD_GOES_TO_DETAIL = true;

export const challengeDetailHref = (challengeId: number) => `/challenges/${challengeId}`;

/** 探索共同挑戰頁的卡片點擊落點（「我參加的挑戰」頁不用這個，維持直接進實踐） */
export const getExploreChallengeCardHref = (
  challenge: ChallengeLinkInput,
  practiceId: string | null | undefined,
  goesToDetailWhenJoined: boolean = JOINED_EXPLORE_CARD_GOES_TO_DETAIL
): string => {
  if (challenge.isJoined && !goesToDetailWhenJoined) {
    const action = getChallengeCardAction(challenge, practiceId);
    if (action.href !== null) return action.href;
  }
  return challengeDetailHref(challenge.id);
};

/** 介紹頁動作：與卡片相同（FR-CC-11），未加入的進行中／已結束改顯示一句說明（AC-05） */
export type ChallengeDetailCta =
  | Exclude<ChallengeCardAction, { kind: "none" }>
  | { kind: "notice"; noticeKey: "detail_notice_ongoing" | "detail_notice_ended" };

export const getChallengeDetailCta = (
  challenge: ChallengeLinkInput,
  practiceId: string | null | undefined
): ChallengeDetailCta => {
  const action = getChallengeCardAction(challenge, practiceId);
  if (action.kind !== "none") return action;
  return {
    kind: "notice",
    noticeKey: challenge.runStatus === "ended" ? "detail_notice_ended" : "detail_notice_ongoing",
  };
};

/** 路由參數轉挑戰 id；非正整數回 null（顯示找不到，AC-07） */
export const parseChallengeId = (raw: string | undefined): number | null => {
  if (!raw || !/^\d+$/.test(raw)) return null;
  const id = Number(raw);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};
