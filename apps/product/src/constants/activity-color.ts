export const ACTIVITY_COLOR_KEYS = ["blue", "green", "yellow", "pink"] as const;
export type ActivityColorKey = (typeof ACTIVITY_COLOR_KEYS)[number];
export const activityColorKey = (id: number): ActivityColorKey =>
  ACTIVITY_COLOR_KEYS[id % ACTIVITY_COLOR_KEYS.length] as ActivityColorKey;
