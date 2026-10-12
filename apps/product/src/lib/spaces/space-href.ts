import type { SpaceListItemType } from "@daodao/api";

/**
 * Where a space card leads (FR-2.6). Event-course cards carry the cohortId:
 * learners go to the existing learner page (design D4), while hosts — who
 * manage the cohort through their organization and have no enrollment — go
 * to the lighthouse cohort dashboard (#201). Missing ids fall back safely.
 */
export function spaceHref(
  space: Pick<SpaceListItemType, "kind" | "id" | "programId" | "isHost">
): string {
  if (space.kind === "personal") return "/spaces/personal";
  if (space.kind === "challenge") return "/spaces/challenge";
  if (!space.id) return "/spaces";
  if (space.isHost && space.programId !== null) {
    return `/lighthouse/programs/${space.programId}/cohorts/${space.id}/dashboard`;
  }
  return `/cohorts/${space.id}`;
}
