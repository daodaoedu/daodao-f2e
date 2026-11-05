import { describe, expect, it } from "vitest";
import {
  getOrganizationInvitationOnboardingUrl,
  getOrganizationInvitationReturnPath,
} from "../organization-invitation-return";

describe("organization invitation registration return", () => {
  it("keeps the invitation and language across onboarding", () => {
    const destination = "/en/organization-invitation";
    const onboarding = new URL(
      getOrganizationInvitationOnboardingUrl(destination),
      "https://app.test"
    );
    expect(onboarding.pathname).toBe("/en/auth/onboarding");
    expect(getOrganizationInvitationReturnPath(onboarding.searchParams.get("redirect"))).toBe(
      destination
    );
  });

  it("preserves only queryless invitation routes in both languages", () => {
    expect(getOrganizationInvitationReturnPath("/organization-invitation")).toBe(
      "/organization-invitation"
    );
    expect(getOrganizationInvitationReturnPath("/zh-TW/organization-invitation")).toBe(
      "/zh-TW/organization-invitation"
    );
  });

  it.each([
    "https://evil.test/organization-invitation?token=abc",
    "//evil.test/organization-invitation?token=abc",
    "/\\evil.test/organization-invitation?token=abc",
    "/%2f%2fevil.test/organization-invitation?token=abc",
    "%2Forganization-invitation?token=abc",
    "/organization-invitation%3Ftoken=abc",
    "/organization-invitation?token=abc#https://evil.test",
    "/organization-invitation?token=abc%0d%0a",
    "/organization-invitation?token=",
    "/organization-invitation?token=secret",
    "/other?token=abc",
    "/en/../organization-invitation?token=abc",
  ])("rejects unsafe or unrelated destination %s", (value) => {
    expect(getOrganizationInvitationReturnPath(value)).toBeNull();
    expect(getOrganizationInvitationOnboardingUrl(value)).toBe("/auth/onboarding");
  });
});
