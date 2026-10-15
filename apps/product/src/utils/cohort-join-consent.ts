type JoinPrivacy = { isPrivate: boolean; checkinDefaultPrivate: boolean };

export type JoinConsentCopy = {
  consentKey: "visibility_consent_private" | "visibility_consent_public";
  pendingNoticeKey: "checkin_default_private_pending" | null;
};

/**
 * 加入頁同意文字（cohort 命名空間的 i18n key），對應場次實際的打卡可見範圍（#279）。
 * - isPrivate 決定實踐的 privacy_status：私密 → 打卡只在本期內（教練＋本期參與者）可見；公開 → 所有人可見
 * - checkinDefaultPrivate 目前只存值、尚未生效（PM 2026-09-03 B1），不能承諾私密，只加註說明
 */
export function resolveJoinConsentCopy(privacy: JoinPrivacy): JoinConsentCopy {
  if (!privacy.isPrivate) {
    return { consentKey: "visibility_consent_public", pendingNoticeKey: null };
  }
  return {
    consentKey: "visibility_consent_private",
    pendingNoticeKey: privacy.checkinDefaultPrivate ? "checkin_default_private_pending" : null,
  };
}
