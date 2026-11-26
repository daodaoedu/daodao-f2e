import { differenceInCalendarDays } from "date-fns";
import { isPracticeVisibleByDate } from "./practice-card";
import { parseLocalDate, practiceEndDateString } from "./practice-period";

/** Your Day 需要的實踐欄位（對應 /api/v1/me/practices 的 MyPracticeItem） */
export interface YourDayPracticeSource {
  id: string;
  status: string;
  startDate?: string | null;
  endDate?: string | null;
  durationDays?: number | null;
  createdAt?: string | null;
  cohortId?: number | null;
  cohortStartDate?: string | null;
  cohortEndDate?: string | null;
  isChallenge?: boolean;
}

export type YourDayPractice<T extends YourDayPracticeSource> = T & {
  /** 決定首頁是否顯示的期間開始日 */
  windowStartDate: string | null;
  /** 決定首頁是否顯示的期間結束日；打卡按鈕據此判斷是否到期 */
  windowEndDate: string | null;
  /** 屬於燈塔等 cohort 期間（非挑戰）：期間由 cohort 決定 */
  usesCohortWindow: boolean;
};

const usesCohortWindow = (practice: YourDayPracticeSource): boolean =>
  practice.cohortId != null &&
  !practice.isChallenge &&
  Boolean(practice.cohortStartDate) &&
  Boolean(practice.cohortEndDate);

const hasStarted = (practice: YourDayPracticeSource, today: Date): boolean => {
  if (!practice.startDate) return true;
  const start = parseLocalDate(practice.startDate);
  return start !== null && differenceInCalendarDays(today, start) >= 0;
};

/**
 * 同一 cohort 多筆實踐時，選出「目前最新」：已開始者中開始日最晚、同日取建立時間較晚；
 * 都還沒開始時取最快開始者，避免未來的實踐搶走目前可用的打卡入口（daodao#569 AC-04）。
 */
const isMoreCurrent = (
  candidate: YourDayPracticeSource,
  current: YourDayPracticeSource,
  today: Date
): boolean => {
  const candidateStarted = hasStarted(candidate, today);
  const currentStarted = hasStarted(current, today);
  if (candidateStarted !== currentStarted) return candidateStarted;

  const candidateStart = candidate.startDate ?? "";
  const currentStart = current.startDate ?? "";
  if (candidateStart !== currentStart) {
    return candidateStarted ? candidateStart > currentStart : candidateStart < currentStart;
  }
  return (candidate.createdAt ?? "") > (current.createdAt ?? "");
};

/**
 * 首頁 Your Day 顯示哪些實踐（daodao#569，延續 #513）：
 * - 只顯示 active，期間含首尾日
 * - 燈塔等 cohort 實踐依 cohort 起訖日；個人實踐與挑戰依實踐自身日期
 * - 同一 cohort 只留一筆，指向目前最新的適用實踐
 */
export function selectYourDayPractices<T extends YourDayPracticeSource>(
  practices: T[],
  today: Date
): YourDayPractice<T>[] {
  const visible = practices
    .filter((practice) => practice.status === "active")
    .map((practice): YourDayPractice<T> => {
      const cohortWindow = usesCohortWindow(practice);
      return {
        ...practice,
        usesCohortWindow: cohortWindow,
        windowStartDate: cohortWindow
          ? (practice.cohortStartDate ?? null)
          : (practice.startDate ?? null),
        windowEndDate: cohortWindow
          ? (practice.cohortEndDate ?? null)
          : practice.endDate || practiceEndDateString(practice.startDate, practice.durationDays),
      };
    })
    .filter((practice) =>
      isPracticeVisibleByDate(practice.windowStartDate, practice.windowEndDate, today)
    );

  const chosenByCohort = new Map<number, YourDayPractice<T>>();
  for (const practice of visible) {
    if (!practice.usesCohortWindow) continue;
    const cohortId = practice.cohortId as number;
    const current = chosenByCohort.get(cohortId);
    if (!current || isMoreCurrent(practice, current, today)) chosenByCohort.set(cohortId, practice);
  }

  // 保留 API 排序：cohort 的那一列放在該 cohort 第一次出現的位置
  const placed = new Set<number>();
  const result: YourDayPractice<T>[] = [];
  for (const practice of visible) {
    if (!practice.usesCohortWindow) {
      result.push(practice);
      continue;
    }
    const cohortId = practice.cohortId as number;
    if (placed.has(cohortId)) continue;
    placed.add(cohortId);
    result.push(chosenByCohort.get(cohortId) as YourDayPractice<T>);
  }
  return result;
}
