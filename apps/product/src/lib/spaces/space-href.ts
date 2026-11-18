import type { SpaceListItemType } from "@daodao/api";

/**
 * Where a space card leads (FR-2.6). Event-course cards carry the cohortId:
 * learners go to their cohort home; organization members go to the same home
 * in a manager view, where joined participants' practices are listed. Missing
 * ids fall back safely.
 */
export function spaceHref(
  space: Pick<SpaceListItemType, "kind" | "id" | "programId" | "canManage">
): string {
  if (space.kind === "personal") return "/spaces/personal";
  if (space.kind === "challenge") return "/spaces/challenge";
  if (!space.id) return "/spaces";
  if (space.canManage && space.programId !== null) {
    return `/cohorts/${space.id}?programId=${space.programId}`;
  }
  return `/cohorts/${space.id}`;
}
