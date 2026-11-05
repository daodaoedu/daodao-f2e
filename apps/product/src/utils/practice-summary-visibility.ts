import type { UpdatePracticeRequestType } from "@daodao/api";
import { PracticeStatus } from "@/constants/practice-status";

export type SummaryPrivacyStatusType = UpdatePracticeRequestType["privacyStatus"];

/** Validate the runtime field until the detail response OpenAPI includes it. */
export function getPracticeSummaryPrivacyStatus(detail: unknown): SummaryPrivacyStatusType {
  if (!detail || typeof detail !== "object" || !("privacyStatus" in detail)) return undefined;
  const value = detail.privacyStatus;
  return value === "public" || value === "private" || value === "delayed" ? value : undefined;
}

/** Summary controls and notices reflect the same persisted sharing setting. */
export function getPracticeSummaryVisibility(
  privacyStatus: SummaryPrivacyStatusType,
  status?: string
) {
  const isPublished = privacyStatus === "public" || privacyStatus === "delayed";
  let notice: "public" | "delayed" | null = null;
  if (privacyStatus === "public") notice = "public";
  if (privacyStatus === "delayed") {
    notice = status === PracticeStatus.completed ? "public" : "delayed";
  }
  return { isPublished, notice };
}
