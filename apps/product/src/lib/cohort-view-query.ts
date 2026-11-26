"use client";

import { useSearchParams } from "@daodao/i18n/navigation";

const COHORT_VIEWS = ["cohort-admin", "cohort-member"];
const COHORT_VIEW_KEYS = ["view", "programId", "cohortId", "members", "memberIndex"];

/**
 * 群組或訪客預覽的 query string，含開頭的 "?"；一般檢視時回空字串。
 * 在實踐頁與打卡頁之間跳轉時接在連結後面，返回實踐頁才不會掉回一般檢視。
 */
export const useCohortViewQuery = (): string => {
  const searchParams = useSearchParams();
  const view = searchParams.get("view");
  if (view === "visitor") return "?view=visitor";
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
