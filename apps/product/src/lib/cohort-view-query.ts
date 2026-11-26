"use client";

import { useSearchParams } from "@daodao/i18n/navigation";

const COHORT_VIEWS = ["cohort-admin", "cohort-member"];
const COHORT_VIEW_KEYS = ["view", "programId", "cohortId", "members", "memberIndex"];

export const VISITOR_PREVIEW_VIEW = "visitor";

type SearchParamsReader = Pick<URLSearchParams, "get">;

/**
 * 群組或訪客預覽的 query string，含開頭的 "?"；一般檢視時回空字串。
 * 在實踐頁與打卡頁之間跳轉時接在連結後面，返回實踐頁才不會掉回一般檢視。
 */
export const buildCohortViewQuery = (searchParams: SearchParamsReader): string => {
  const view = searchParams.get("view");
  if (view === VISITOR_PREVIEW_VIEW) return `?view=${VISITOR_PREVIEW_VIEW}`;
  if (!view || !COHORT_VIEWS.includes(view)) {
    return "";
  }

  const query = new URLSearchParams();
  for (const key of COHORT_VIEW_KEYS) {
    const value = searchParams.get(key);
    if (value) {
      query.set(key, value);
    }
  }
  return `?${query.toString()}`;
};

export const useCohortViewQuery = (): string => buildCohortViewQuery(useSearchParams());
