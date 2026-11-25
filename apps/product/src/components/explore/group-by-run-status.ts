export const RUN_STATUSES = ["upcoming", "ongoing", "ended"] as const;
export type RunStatus = (typeof RUN_STATUSES)[number];

/**
 * 依運行狀態分區，固定順序：即將開始 → 進行中 → 已結束；沒有項目的區不回傳。
 * 探索共同挑戰與探索活動課程共用（daodao#567）。
 */
export function groupByRunStatus<T extends { runStatus: string }>(
  items: T[]
): { status: RunStatus; items: T[] }[] {
  return RUN_STATUSES.map((status) => ({
    status,
    items: items.filter((item) => item.runStatus === status),
  })).filter((group) => group.items.length > 0);
}
