import type { ActivityDetailType } from "@daodao/api";
import { prepareSessionSubmission, type SessionEntry } from "@/utils/cohort-sessions";

/** 場次設定表單目前的值（含尚未儲存的修改），用來組出發布前預覽。 */
export interface ActivityPreviewForm {
  displayName: string;
  tagline: string;
  startDate: string;
  endDate: string;
  timezone: string;
  interactionModes: string[];
  sessions: SessionEntry[];
  location: string;
  feeType: "free" | "paid";
  feeAmount: string;
  signupMethod: "island_form" | "external";
  externalSignupUrl: string;
  templateCount: number;
}

export interface ActivityPreviewContext {
  cohortId?: number;
  programName: string;
  programDescription: string | null;
  organization: ActivityDetailType["organization"];
  host: ActivityDetailType["host"];
  /** 標題空白時顯示的文字 */
  untitledName: string;
}

const INTERACTION_MODES = ["sync", "async", "physical"] as const;
type InteractionMode = (typeof INTERACTION_MODES)[number];
const isInteractionMode = (mode: string): mode is InteractionMode =>
  (INTERACTION_MODES as readonly string[]).includes(mode);

/** 以日曆日（yyyy-MM-dd）比較，推出探索頁使用的活動狀態。 */
export const resolvePreviewRunStatus = (
  startDate: string,
  endDate: string,
  today: string
): ActivityDetailType["runStatus"] => {
  if (endDate && today > endDate) return "ended";
  if (startDate && today < startDate) return "upcoming";
  return "ongoing";
};

/**
 * 把場次設定表單轉成活動詳情頁資料，供 ActivityDetailView 預覽（daodao#543）。
 * 預覽以未加入的探索者視角呈現（地點遮蔽、不可加入），不呼叫任何 API。
 */
export function buildActivityPreview(
  form: ActivityPreviewForm,
  context: ActivityPreviewContext,
  today: string
): ActivityDetailType {
  const interactionModes = form.interactionModes.filter(isInteractionMode);
  const sessions = prepareSessionSubmission(form.sessions, form.interactionModes)
    .sessions.filter((session) => session.sessionDate)
    .map((session, index) => ({
      id: index + 1,
      sessionDate: session.sessionDate,
      startTime: session.startTime || null,
      endTime: session.endTime || null,
      recurrenceGroupId: session.recurrenceGroupId,
      recurrenceRule: session.recurrenceRule,
    }));
  const feeAmount = Number.parseInt(form.feeAmount, 10);
  const signupMethod = form.feeType === "paid" ? "external" : form.signupMethod;

  return {
    id: context.cohortId ?? 0,
    displayName: form.displayName.trim() || context.untitledName,
    tagline: form.tagline.trim() || null,
    programName: context.programName,
    description: context.programDescription,
    organizationName: context.organization.name,
    host: context.host,
    startDate: form.startDate,
    endDate: form.endDate,
    joinDeadline: null,
    capacity: null,
    participantCount: 0,
    interactionModes,
    location: form.location.trim() || null,
    feeType: form.feeType,
    feeAmount: form.feeType === "paid" && Number.isFinite(feeAmount) ? feeAmount : null,
    signupMethod,
    templateCount: form.templateCount,
    runStatus: resolvePreviewRunStatus(form.startDate, form.endDate, today),
    canJoin: false,
    unavailableReason: null,
    isJoined: false,
    joinToken: null,
    timezone: form.timezone,
    sessions,
    externalSignupUrl: signupMethod === "external" ? form.externalSignupUrl.trim() || null : null,
    organization: context.organization,
    inviteMessage: null,
  };
}

interface PreviewHostCandidate {
  userId: number | null;
  nickname: string | null;
}

/**
 * 預覽的發起人沿用公開活動頁（server activity.service resolveHosts）的順序：
 * 1. 場次 owner（已加入、最早加入）2. 組織 owner（最早加入）3. 組織名稱。
 * 預覽不連到個人頁，因此只帶名稱與 userId。
 */
export function resolvePreviewHost(
  cohortEnrollments: (PreviewHostCandidate & {
    role: string;
    status: string;
    joinedAt: string | null;
  })[],
  organizationOwners: (PreviewHostCandidate & { createdAt: string })[],
  organizationName: string
): ActivityDetailType["host"] {
  const byTime = <T>(items: T[], at: (item: T) => string) =>
    [...items].sort((a, b) => at(a).localeCompare(at(b)));
  const cohortOwner = byTime(
    cohortEnrollments.filter(
      (item) =>
        item.role === "owner" && item.status === "joined" && item.userId !== null && item.joinedAt
    ),
    (owner) => owner.joinedAt ?? ""
  )[0];
  const owner = cohortOwner ?? byTime(organizationOwners, (item) => item.createdAt)[0];
  if (!owner) return { userId: null, name: organizationName, avatar: null, identifier: null };
  return {
    userId: owner.userId,
    name: owner.nickname || organizationName,
    avatar: null,
    identifier: null,
  };
}

/** 會議連結：接受省略 https:// 的 Google Meet 網址，存成可開啟的 https 連結（daodao#543 AC-03）。 */
export function normalizeMeetingUrl(value: FormDataEntryValue | null): string | null {
  const meetingUrl = String(value ?? "").trim();
  if (!meetingUrl) return null;
  return /^meet\.google\.com\//i.test(meetingUrl) ? `https://${meetingUrl}` : meetingUrl;
}
