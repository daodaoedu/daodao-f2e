import { Box, Flag, type LucideIcon, Star } from "lucide-react";
import type { RunStatus } from "./group-by-run-status";

/** 探索頁各狀態分區的圖示；已結束用淡色（daodao#567） */
export const RUN_STATUS_SECTION: Record<RunStatus, { Icon: LucideIcon; muted: boolean }> = {
  upcoming: { Icon: Star, muted: false },
  ongoing: { Icon: Flag, muted: false },
  ended: { Icon: Box, muted: true },
};
