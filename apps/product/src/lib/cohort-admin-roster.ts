export interface IRosterEnrollment {
  id: number;
  userId: number | null;
  nickname: string | null;
  email: string | null;
  status: string;
}
export interface IRosterPractice {
  userId: number;
  practiceId: number;
  practiceTitle: string;
  nickname: string | null;
  checkinCount: number;
}
export interface IRosterActivity {
  userId: number;
  practiceId: number;
  lastActivityAt: string | null;
}
export const RosterPracticeStatus = {
  loading: "loading",
  error: "error",
  ready: "ready",
  unavailable: "unavailable",
} as const;
export type RosterPracticeStatusType =
  (typeof RosterPracticeStatus)[keyof typeof RosterPracticeStatus];
export type RosterSortFieldType = "name" | "checkins" | "activity";
export type RosterSortDirectionType = "asc" | "desc";
export interface IRosterParticipant {
  enrollmentId: number;
  userId: number | null;
  nickname: string | null;
  email: string | null;
  practiceId: number | null;
  checkinCount: number | null;
  lastActivityAt: string | null;
  practiceStatus: RosterPracticeStatusType;
}
export interface IRosterOptions {
  enrollments: IRosterEnrollment[];
  practices: IRosterPractice[];
  activity: IRosterActivity[];
  practiceStatus: "loading" | "error" | "ready";
  selectedPractice?: string;
  search?: string;
  sortField?: RosterSortFieldType;
  sortDirection?: RosterSortDirectionType;
}

/** Enrollment identity survives missing, failed and still-loading practice queries. */
export function buildCohortAdminRoster(options: IRosterOptions): IRosterParticipant[] {
  const activity = new Map(
    options.activity.map((row) => [`${row.userId}:${row.practiceId}`, row.lastActivityAt])
  );
  const normalizedSearch = (options.search ?? "").trim().toLocaleLowerCase();
  const rows: IRosterParticipant[] = [];
  for (const enrollment of options.enrollments) {
    if (enrollment.status !== "joined") continue;
    const practices = options.practices.filter((row) => row.userId === enrollment.userId);
    const nickname = enrollment.nickname ?? practices[0]?.nickname ?? null;
    if (
      normalizedSearch &&
      !`${nickname ?? ""} ${enrollment.email ?? ""}`.toLocaleLowerCase().includes(normalizedSearch)
    ) {
      continue;
    }
    const matchingPractices = practices.filter(
      (row) => !options.selectedPractice || row.practiceTitle === options.selectedPractice
    );
    // Missing practice data cannot prove that a known joined member does not match.
    if (options.selectedPractice && practices.length > 0 && matchingPractices.length === 0) {
      continue;
    }
    const orderedPractices = [...matchingPractices].sort((a, b) => {
      const aActivity = activity.get(`${a.userId}:${a.practiceId}`) ?? "";
      const bActivity = activity.get(`${b.userId}:${b.practiceId}`) ?? "";
      return (
        bActivity.localeCompare(aActivity) ||
        a.practiceTitle.localeCompare(b.practiceTitle) ||
        a.practiceId - b.practiceId
      );
    });
    const preferred = orderedPractices[0];
    let practiceStatus: RosterPracticeStatusType = options.practiceStatus;
    if (options.practiceStatus === RosterPracticeStatus.ready && !preferred) {
      practiceStatus = RosterPracticeStatus.unavailable;
    }
    rows.push({
      enrollmentId: enrollment.id,
      userId: enrollment.userId,
      nickname,
      email: enrollment.email,
      practiceId: preferred?.practiceId ?? null,
      checkinCount: preferred
        ? matchingPractices.reduce((sum, row) => sum + row.checkinCount, 0)
        : null,
      lastActivityAt: preferred
        ? (activity.get(`${preferred.userId}:${preferred.practiceId}`) ?? null)
        : null,
      practiceStatus,
    });
  }
  const direction = options.sortDirection === "desc" ? -1 : 1;
  return rows.sort((a, b) => {
    if (options.sortField === "checkins") {
      if (a.checkinCount === null && b.checkinCount !== null) return 1;
      if (a.checkinCount !== null && b.checkinCount === null) return -1;
      const comparison = ((a.checkinCount ?? 0) - (b.checkinCount ?? 0)) * direction;
      if (comparison) return comparison;
    }
    if (options.sortField === "activity") {
      if (a.lastActivityAt === null && b.lastActivityAt !== null) return 1;
      if (a.lastActivityAt !== null && b.lastActivityAt === null) return -1;
      const comparison = (a.lastActivityAt ?? "").localeCompare(b.lastActivityAt ?? "") * direction;
      if (comparison) return comparison;
    }
    const nameDirection = options.sortField === "name" ? direction : 1;
    return (
      (a.nickname ?? "").localeCompare(b.nickname ?? "") * nameDirection ||
      a.enrollmentId - b.enrollmentId
    );
  });
}
