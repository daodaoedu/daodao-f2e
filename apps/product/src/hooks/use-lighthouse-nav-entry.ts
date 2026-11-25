"use client";

import { useCoachResourceBindings, useLighthouseOrganizations } from "@daodao/api";
import { useAuth } from "@daodao/auth";
import {
  type LighthouseAccessCheck,
  resolveLighthouseNavEntry,
} from "@/utils/lighthouse-nav-entry";

function toCheck(query: { data?: unknown; error?: unknown; isLoading: boolean }) {
  if (query.error) return { state: "error", error: query.error } satisfies LighthouseAccessCheck;
  const data = (query.data as { data?: unknown } | undefined)?.data;
  if (Array.isArray(data))
    return { state: "loaded", count: data.length } satisfies LighthouseAccessCheck;
  return { state: "loading" } satisfies LighthouseAccessCheck;
}

// 側欄常駐不會重新掛載；全域設定關掉 focus revalidation，成員異動要靠切回分頁時重查
const RECHECK_ON_FOCUS = { revalidateOnFocus: true } as const;

/** Sidebar 燈塔 link for the signed-in user, or null to hide it (daodao#568). */
export function useLighthouseNavEntry(): string | null {
  const { isAuthenticated } = useAuth();
  const organizationsQuery = useLighthouseOrganizations(isAuthenticated, RECHECK_ON_FOCUS);
  const organizations: LighthouseAccessCheck = toCheck(organizationsQuery);
  // 只有確定不是組織成員時才查團主綁定，成員不多打一支 API
  const needsBindings =
    isAuthenticated &&
    (organizations.state === "error" ||
      (organizations.state === "loaded" && organizations.count === 0));
  const bindings: LighthouseAccessCheck = toCheck(
    useCoachResourceBindings(needsBindings, RECHECK_ON_FOCUS)
  );

  if (!isAuthenticated) return null;
  return resolveLighthouseNavEntry(organizations, bindings);
}
