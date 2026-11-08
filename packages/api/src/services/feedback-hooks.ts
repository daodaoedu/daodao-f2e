"use client";

/**
 * 錯誤回報 API Hooks（daodao#451「我的回報」）
 */

import { EMPTY_QUERY_INIT, useQuery } from "../hooks";
import type { MyBugReportList } from "./feedback";

type UntypedQuery = (
  path: string,
  options: Record<string, unknown> | null,
  config?: { revalidateOnFocus?: boolean }
) => {
  data?: { data?: MyBugReportList };
  isLoading: boolean;
  error?: unknown;
  mutate: () => Promise<unknown>;
};

/** 登入者自己送出的錯誤回報與團隊回覆（新到舊）；server 只回本人的資料 */
export const useMyBugReports = (options?: { enabled?: boolean }) => {
  const enabled = options?.enabled ?? true;
  // /api/v1/feedback/mine 尚未出現在 src/types.ts（等 server 合併後 gen:types）
  const useUntypedQuery = useQuery as unknown as UntypedQuery;
  return useUntypedQuery("/api/v1/feedback/mine", enabled ? EMPTY_QUERY_INIT : null, {
    revalidateOnFocus: true,
  });
};
