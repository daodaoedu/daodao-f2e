import type { ActivitySummaryType } from "@daodao/api";

export const ACTIVITY_STATUS_FILTERS = ["all", "open", "ongoing", "ended"] as const;
export type ActivityStatusFilter = (typeof ACTIVITY_STATUS_FILTERS)[number];

export type ActivityFeeFilter = "free" | "paid" | null;

export const matchesStatus = (a: ActivitySummaryType, f: ActivityStatusFilter): boolean =>
  f === "all"
    ? true
    : f === "open"
      ? a.canJoin && a.runStatus !== "ended"
      : f === "ongoing"
        ? a.runStatus === "ongoing"
        : a.runStatus === "ended";

export const matchesFee = (a: ActivitySummaryType, fee: ActivityFeeFilter): boolean =>
  fee === null ? true : (a.feeType === "paid") === (fee === "paid");

const normalize = (s: string) => s.toLocaleLowerCase("zh-TW").trim();

export const searchActivities = (
  activities: ActivitySummaryType[],
  query: string,
  statusFilter: ActivityStatusFilter,
  feeFilter: ActivityFeeFilter
): ActivitySummaryType[] => {
  const q = normalize(query);
  return activities.filter((a) => {
    if (!matchesStatus(a, statusFilter)) return false;
    if (!matchesFee(a, feeFilter)) return false;
    if (!q) return true;
    const fields = [
      a.displayName,
      a.tagline,
      a.description,
      a.host.name,
      a.organizationName,
      a.location,
    ];
    return fields.some((f) => f && normalize(f).includes(q));
  });
};
