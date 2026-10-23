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
}

/**
 * 編輯頁 Step2 各欄位的鎖定狀態（daodao#385）。
 *
 * - 期間（開始日、天數）：有打卡、或共同挑戰（server CHALLENGE_LOCKED_UPDATE_FIELDS、FRD FR-CC-10）
 * - 頻率：只在有打卡時鎖（server stripLockedFields），共同挑戰不另外鎖
 */
export function getEditScheduleLocks(practice: EditScheduleLockInput | undefined): {
  periodLocked: boolean;
  frequencyLocked: boolean;
} {
  const hasCheckIns = isPracticeScheduleLocked(practice);
  return {
    periodLocked: hasCheckIns || practice?.isChallenge === true,
    frequencyLocked: hasCheckIns,
  };
}
