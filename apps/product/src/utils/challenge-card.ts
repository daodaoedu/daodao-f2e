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
 * 打卡／觀看總結膠囊是否要以「不可點」樣式呈現：未開始（Disable），
 * 或不知道實踐 id 而沒有連結時——避免看起來可點、點了卻沒反應（daodao#183）。
 */
export const isChallengeActionMuted = (action: ChallengeCardAction): boolean =>
  action.kind === "checkin-disabled" ||
  ((action.kind === "checkin" || action.kind === "summary") && action.href === null);

/**
 * 卡片用的「挑戰 id → 自動複製實踐 id」對照：以 `/me/challenges` 為主，
 * 剛加入（join API 已回傳 practiceId、但列表尚未 revalidate）的挑戰以回傳值補上，
 * 讓加入後的卡片立即可點。
 */
export const buildPracticeIdMap = (
  mine: ReadonlyArray<{ id: number; practiceId: string | null }>,
  justJoined: Readonly<Record<number, string | null>>
): Map<number, string | null> => {
  const map = new Map<number, string | null>(mine.map((item) => [item.id, item.practiceId]));
  for (const [id, practiceId] of Object.entries(justJoined)) {
    if (practiceId && !map.get(Number(id))) map.set(Number(id), practiceId);
  }
  return map;
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
