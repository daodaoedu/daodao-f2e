"use client";

import { useLighthouseAccessProbe } from "@daodao/api";
import { useAuth } from "@daodao/auth";
import { classifyLighthouseAccess, resolveLighthouseNavEntry } from "@/utils/lighthouse-nav-entry";

// 側欄常駐不會重新掛載；全域設定關掉 focus revalidation，成員異動要靠切回分頁時重查
const RECHECK_ON_FOCUS = { revalidateOnFocus: true } as const;

/** Sidebar 燈塔 link for the signed-in user, or null to hide it (daodao#568). */
export function useLighthouseNavEntry(): string | null {
  const { isAuthenticated } = useAuth();
  const organizations = classifyLighthouseAccess(
    useLighthouseAccessProbe("/api/v1/lighthouse/organizations", isAuthenticated, RECHECK_ON_FOCUS)
  );
  // 只有確定不是組織成員時才查團主綁定，成員不多打一支 API
  const needsBindings =
    isAuthenticated &&
    (organizations.state === "denied" ||
      (organizations.state === "loaded" && organizations.count === 0));
  const bindings = classifyLighthouseAccess(
    useLighthouseAccessProbe(
      "/api/v1/lighthouse/my-cohort-resource-bindings",
      needsBindings,
      RECHECK_ON_FOCUS
    )
  );

  if (!isAuthenticated) return null;
  return resolveLighthouseNavEntry(organizations, bindings);
}
