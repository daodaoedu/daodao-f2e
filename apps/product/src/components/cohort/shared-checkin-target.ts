import { differenceInCalendarDays } from "date-fns";
import { isPracticeEnded, parseLocalDate } from "@/utils/practice-period";

/** 共用打卡連結需要的實踐欄位（取自 GET /api/v1/cohorts/{cohortId}，已由伺服器限定為登入者本人的實踐） */
export interface SharedCheckinPractice {
  id: string;
  status: "draft" | "not_started" | "active" | "completed" | "archived";
  templateId?: number | null;
  startDate?: string | null;
  endDate?: string | null;
}

export type SharedCheckinTarget<P extends SharedCheckinPractice = SharedCheckinPractice> =
  | { kind: "not_found" }
  | { kind: "ambiguous"; count: number }
  | { kind: "unavailable"; practice: P }
  | { kind: "not_started"; practice: P }
  | { kind: "ended"; practice: P }
  | { kind: "ready"; practice: P };

/**
 * 依 cohortId＋templateId 的共用連結，找出登入者自己的那一筆實踐並判斷能否打卡（daodao-f2e#1194）。
 * - 只看同模板的實踐，找不到時不回退到其他模板
 * - 同模板多筆視為資料歧義，不任意挑一筆
 * - 草稿需先到期首頁啟用；已完成、封存或過結束日視為已結束；打卡規則仍以伺服器為準
 */
export function resolveSharedCheckinTarget<P extends SharedCheckinPractice>(
  practices: readonly P[],
  templateId: number,
  now: Date
): SharedCheckinTarget<P> {
  const matches = practices.filter((practice) => practice.templateId === templateId);
  if (matches.length === 0) return { kind: "not_found" };
  if (matches.length > 1) return { kind: "ambiguous", count: matches.length };

  const practice = matches[0] as P;
  if (practice.status === "draft") return { kind: "unavailable", practice };
  // 封存無法從期首頁重新啟用，對學員而言等同已結束
  if (
    practice.status === "completed" ||
    practice.status === "archived" ||
    isPracticeEnded(practice.endDate, now)
  )
    return { kind: "ended", practice };

  const start = practice.startDate ? parseLocalDate(practice.startDate) : null;
  if (start && differenceInCalendarDays(start, now) > 0) return { kind: "not_started", practice };
  return { kind: "ready", practice };
}
