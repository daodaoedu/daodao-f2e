export const ORGANIZATION_INVITATION_COOKIE = "organization_invitation";
export const ORGANIZATION_INVITATION_PATH = /^\/(?:(?:en|zh-TW)\/)?organization-invitation$/;

/** Reject malformed tokens before storing them in the recipient browser. */
export function isOrganizationInvitationToken(value: string | null): value is string {
  return value !== null && /^[a-f0-9]{64}$/.test(value);
}
