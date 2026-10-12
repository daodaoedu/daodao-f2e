import type { SpaceListItemType } from "@daodao/api";

/**
 * Where a space card leads (FR-2.6). Event-course cards carry the cohortId:
 * learners go to the existing learner page (design D4), while organization
 * members — who manage the cohort without an enrollment — go to the
 * lighthouse cohort dashboard (#201). Missing ids fall back safely.
 */
export function spaceHref(
  space: Pick<SpaceListItemType, "kind" | "id" | "programId" | "canManage">
): string {
  if (space.kind === "personal") return "/spaces/personal";
  if (space.kind === "challenge") return "/spaces/challenge";
  if (!space.id) return "/spaces";
  if (space.canManage && space.programId !== null) {
    return `/lighthouse/programs/${space.programId}/cohorts/${space.id}/dashboard`;
  }
  return `/cohorts/${space.id}`;
}
