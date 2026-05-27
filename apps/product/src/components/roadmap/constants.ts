import type { BoardTab, RoadmapCategory, RoadmapStatus } from "@daodao/api";

export const ROADMAP_CATEGORIES: RoadmapCategory[] = [
  "operation",
  "practice",
  "social",
  "explore",
  "challenge",
  "ai",
  "profile",
  "other",
];

export const BOARD_TABS: BoardTab[] = ["all", "scheduled", "discussing", "done"];

/** i18n key（roadmap namespace） */
export const categoryKey = (c: RoadmapCategory) => `cat_${c}` as const;
export const statusKey = (s: RoadmapStatus) => `status_${s}` as const;
export const tabKey = (t: BoardTab) => `tab_${t}` as const;

export const WISH_DRAFT_KEY = "daodao:wish-draft";
export const WISH_DRAFT_TTL_MS = 24 * 60 * 60 * 1000; // 24h
