import type { ActivityDetailType } from "@daodao/api";

/** 不可加入原因 → i18n key（explore_activities namespace） */
export const ACTIVITY_UNAVAILABLE_REASON_KEY = {
  full: "detail_cta_full",
  paused: "detail_cta_paused",
  expired: "detail_cta_expired",
  ended: "detail_cta_ended",
} as const;

export type ActivityUnavailableReasonKey =
  (typeof ACTIVITY_UNAVAILABLE_REASON_KEY)[keyof typeof ACTIVITY_UNAVAILABLE_REASON_KEY];

export type ActivityDetailCta =
  | { kind: "joined"; href: string }
  | { kind: "external"; href: string }
  | { kind: "join"; href: string }
  | { kind: "disabled"; reasonKey: ActivityUnavailableReasonKey }
  | { kind: "none" };

type CtaInput = Pick<
  ActivityDetailType,
  | "id"
  | "isJoined"
  | "canJoin"
  | "runStatus"
  | "unavailableReason"
  | "joinToken"
  | "signupMethod"
  | "externalSignupUrl"
>;

/**
 * 活動詳情頁 CTA（OpenSpec explore-activities-ui「活動詳情頁」）：
 * isJoined → 前往學員頁；canJoin 且可報名 → 外部報名或加入；
 * 否則停用並顯示原因（額滿／暫停加入／報名截止／已結束）。
 */
export const resolveActivityDetailCta = (activity: CtaInput): ActivityDetailCta => {
  if (activity.isJoined) {
    return { kind: "joined", href: `/cohorts/${activity.id}` };
  }

  if (activity.canJoin && activity.runStatus !== "ended") {
    if (activity.signupMethod === "external" && activity.externalSignupUrl) {
      return { kind: "external", href: activity.externalSignupUrl };
    }
    if (activity.joinToken) {
      return { kind: "join", href: `/cohorts/join/${activity.joinToken}` };
    }
    return { kind: "none" };
  }

  const reason = activity.runStatus === "ended" ? "ended" : activity.unavailableReason;
  if (reason && reason in ACTIVITY_UNAVAILABLE_REASON_KEY) {
    return { kind: "disabled", reasonKey: ACTIVITY_UNAVAILABLE_REASON_KEY[reason] };
  }
  return { kind: "none" };
};
