type JoinUnavailableReason = "not_published" | "expired" | "full" | "paused";

type JoinAvailability = {
  unavailableReason: JoinUnavailableReason | null;
  unavailableReasons?: JoinUnavailableReason[];
};

export type JoinUnavailableCopy = {
  titleKey: `unavailable_${JoinUnavailableReason}`;
  showDeadline: boolean;
  alsoKeys: Array<`unavailable_${JoinUnavailableReason}`>;
  showPausedCopy: boolean;
};

/**
 * 加入頁不可加入時的文案（cohort 命名空間的 i18n key），daodao#281。
 * - 標題用主要原因（server 依優先序排第一個）；其餘成立的原因逐行列出，截止＋暫停兩個都看得到
 * - 「請改用邀請信」只在單純暫停時顯示：已截止時邀請信也進不來，不能這樣引導
 */
export function resolveJoinUnavailableCopy(info: JoinAvailability): JoinUnavailableCopy | null {
  const reasons = info.unavailableReasons?.length
    ? info.unavailableReasons
    : info.unavailableReason
      ? [info.unavailableReason]
      : [];
  const [primary, ...others] = reasons;
  if (!primary) return null;
  return {
    titleKey: `unavailable_${primary}`,
    showDeadline: reasons.includes("expired"),
    alsoKeys: others.map((reason) => `unavailable_${reason}` as const),
    showPausedCopy: reasons.length === 1 && primary === "paused",
  };
}
