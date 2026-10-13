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
