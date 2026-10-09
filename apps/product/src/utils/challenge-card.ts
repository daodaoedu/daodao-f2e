import type { ChallengeRunStatusType, ChallengeSummaryType } from "@daodao/api";

type ChallengeCardInput = Pick<
  ChallengeSummaryType,
  "isJoined" | "canJoin" | "unavailableReason" | "runStatus"
>;

/**
 * 共同挑戰卡片右下角的動作（FR-CC-11 卡片狀態）
 *
 * - 未加入：現在加入（已額滿／報名截止時停用）；已結束則不顯示
 * - 已加入、未開始：打卡（Disable，不可點）
 * - 已加入、進行中：打卡 → 連到自動複製的實踐頁打卡
 * - 已加入、已結束：觀看總結 → 連到實踐總結頁
 *
 * `href` 為 null 代表卡片不可點（不知道實踐 id 時也是）。
 */
export type ChallengeCardAction =
  | {
      kind: "join";
      labelKey: "cta_join" | "cta_full" | "cta_closed";
      disabled: boolean;
      href: null;
    }
  | { kind: "checkin"; labelKey: "cta_checkin"; href: string | null }
  | { kind: "checkin-disabled"; labelKey: "cta_checkin"; href: null }
  | { kind: "summary"; labelKey: "cta_view_summary"; href: string | null }
  | { kind: "none"; href: null };

const practiceHref = (practiceId: string | null | undefined, suffix = "") =>
  practiceId ? `/practices/${encodeURIComponent(practiceId)}${suffix}` : null;

export const getChallengeCardAction = (
  challenge: ChallengeCardInput,
  practiceId: string | null | undefined
): ChallengeCardAction => {
  if (!challenge.isJoined) {
    if (challenge.runStatus === "ended") return { kind: "none", href: null };
    const labelKey = challenge.canJoin
      ? "cta_join"
      : challenge.unavailableReason === "full"
        ? "cta_full"
        : "cta_closed";
    return { kind: "join", labelKey, disabled: !challenge.canJoin, href: null };
  }

  switch (challenge.runStatus) {
    case "upcoming":
      return { kind: "checkin-disabled", labelKey: "cta_checkin", href: null };
    case "ongoing":
      return { kind: "checkin", labelKey: "cta_checkin", href: practiceHref(practiceId) };
    case "ended":
      return {
        kind: "summary",
        labelKey: "cta_view_summary",
        href: practiceHref(practiceId, "/summary"),
      };
  }
};

/**
 * 卡片狀態徽章文案 key：已加入的挑戰結束後顯示「已完成」（與篩選選單一致，FR-CC-11），
 * 未加入的已結束挑戰（探索頁「已結束」區）維持「已結束」。
 */
export const getChallengeStatusKey = (
  runStatus: ChallengeRunStatusType,
  isJoined: boolean
): "status_upcoming" | "status_ongoing" | "status_ended" | "status_completed" => {
  if (runStatus === "ended") return isJoined ? "status_completed" : "status_ended";
  return runStatus === "upcoming" ? "status_upcoming" : "status_ongoing";
};
