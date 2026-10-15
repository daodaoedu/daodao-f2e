/**
 * 名單預覽後「寄出邀請」是否可按（FR-RS-03）。
 *
 * server 預覽回傳 blockedReason（期不可加入的原因）與各狀態計數；
 * 不可加入（daodao#281）、全是已加入者（daodao#282）或沒有可寄的 email 時都要停用並說明原因。
 */

export type InvitationBlockReason = "not_published" | "expired" | "full";

export type InvitationSendDisabledReason = InvitationBlockReason | "all_joined" | "none_sendable";

export interface InvitationPreviewSummary {
  sendableCount: number;
  skippedCount: number;
  errorCount: number;
  blockedReason: InvitationBlockReason | null;
}

export function getInvitationSendDisabledReason(
  summary: InvitationPreviewSummary
): InvitationSendDisabledReason | null {
  if (summary.blockedReason) return summary.blockedReason;
  if (summary.sendableCount > 0) return null;
  return summary.skippedCount > 0 ? "all_joined" : "none_sendable";
}
