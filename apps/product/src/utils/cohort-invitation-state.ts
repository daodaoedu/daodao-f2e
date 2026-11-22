type CohortMembershipQueryType = {
  data?: { data: { cohortId: number; status: string }[] };
  error?: unknown;
  validationError?: unknown;
  isLoading: boolean;
  isValidating: boolean;
};

export function resolveCohortInvitationState({
  isAuthenticated,
  isAuthLoading,
  cohortId,
  membership,
}: {
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  cohortId: number;
  membership: CohortMembershipQueryType;
}): "loading" | "error" | "joined" | "consent" {
  if (isAuthLoading) return "loading";
  if (!isAuthenticated) return "consent";
  // A failed refresh must not let cached membership decide navigation.
  if (membership.error || membership.validationError) return "error";
  if (membership.isLoading || membership.isValidating || !membership.data) return "loading";
  // /me/cohorts already restricts this list to joined enrollments.
  if (membership.data.data.some((cohort) => cohort.cohortId === cohortId)) return "joined";

  return "consent";
}
