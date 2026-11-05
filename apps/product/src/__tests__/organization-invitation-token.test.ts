import { describe, expect, it } from "vitest";
import {
  isOrganizationInvitationToken,
  ORGANIZATION_INVITATION_PATH,
} from "../lib/organization-invitation-token";

describe("invitation cookie admission", () => {
  it("accepts URL-safe opaque tokens without normalizing the secret", () => {
    expect(isOrganizationInvitationToken("ab0123cd".repeat(8))).toBe(true);
  });
  it.each([
    null,
    "",
    " leading",
    "a/b",
    "a;b",
    "a\r\nb",
    "a".repeat(65),
    "a".repeat(63),
    "A".repeat(64),
  ])("rejects malformed token %s", (token) => {
    expect(isOrganizationInvitationToken(token)).toBe(false);
  });
  it.each([
    "/organization-invitation",
    "/en/organization-invitation",
    "/zh-TW/organization-invitation",
  ])("limits cookie admission to exact invitation route %s", (path) => {
    expect(ORGANIZATION_INVITATION_PATH.test(path)).toBe(true);
  });
  it.each([
    "/other/organization-invitation",
    "/organization-invitation/other",
    "/en/../organization-invitation",
  ])("does not process unrelated route %s", (path) => {
    expect(ORGANIZATION_INVITATION_PATH.test(path)).toBe(false);
  });
});
