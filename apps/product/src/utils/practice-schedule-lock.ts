import { PracticeStatus } from "../constants/practice-status";

interface PracticeScheduleLockInput {
  status?: string;
  checkInCount?: number;
}

/**
 * 實踐的期間／頻率是否已鎖定不可修改。
 *
 * 與 server 的 stripLockedFields 一致：有打卡記錄才鎖。不能用 status === "active" 判斷——
 * 開始日已到的實踐建立即為 active（daodao#212），還沒打卡前仍可調整。
 */
export function isPracticeScheduleLocked(practice: PracticeScheduleLockInput | undefined): boolean {
  return (practice?.checkInCount ?? 0) > 0;
}

interface EditScheduleLockInput extends PracticeScheduleLockInput {
  isChallenge?: boolean;
  isLighthouseCohortPractice?: boolean;
}

/**
 * 編輯頁 Step2 各欄位的鎖定狀態（daodao#385）。
 *
 * - 期間（開始日、天數）：有打卡、共同挑戰，或 Lighthouse 場次實踐
 * - 頻率：只在有打卡時鎖（server stripLockedFields），共同挑戰不另外鎖
 */
export function getEditScheduleLocks(practice: EditScheduleLockInput | undefined): {
  periodLocked: boolean;
  frequencyLocked: boolean;
} {
  const hasCheckIns = isPracticeScheduleLocked(practice);
  return {
    periodLocked:
      hasCheckIns ||
      practice?.isChallenge === true ||
      practice?.isLighthouseCohortPractice === true,
    frequencyLocked: hasCheckIns,
  };
}

/** Lighthouse cohort assignments are available to check in only after they leave draft. */
export function getCohortPracticeDisplayStatus(
  status: PracticeStatus | undefined,
  isCohortPractice: boolean
): PracticeStatus | undefined {
  return isCohortPractice && status === PracticeStatus.draft ? PracticeStatus.notStarted : status;
}

/** Avoid submitting unchanged schedule fields for Lighthouse-controlled assignments. */
export const withoutLighthouseLockedScheduleFields = <T extends object>(
  request: T,
  isLighthouseCohortPractice: boolean
): T | Omit<T, "startDate" | "durationDays"> => {
  if (!isLighthouseCohortPractice) return request;
  const editable = { ...request } as Record<string, unknown>;
  delete editable.startDate;
  delete editable.durationDays;
  return editable as Omit<T, "startDate" | "durationDays">;
};
