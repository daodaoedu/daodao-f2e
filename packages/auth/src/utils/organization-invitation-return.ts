/** Keep only the local invitation route; its token remains in a host-only HttpOnly cookie. */
export function getOrganizationInvitationReturnPath(
  value: string | null | undefined
): string | null {
  if (!value || !/^\/(?:(?:zh-TW|en)\/)?organization-invitation$/.test(value)) return null;
  return value;
}

/** Attach only an allowlisted invitation destination to onboarding. */
export function getOrganizationInvitationOnboardingUrl(
  returnPath: string | null | undefined
): string {
  const invitationPath = getOrganizationInvitationReturnPath(returnPath);
  if (!invitationPath) return "/auth/onboarding";
  const localePrefix = invitationPath.startsWith("/en/") ? "/en" : "";
  return `${localePrefix}/auth/onboarding?redirect=${encodeURIComponent(invitationPath)}`;
}
