import { describe, expect, it } from "vitest";
import { getPostLogoutLoginPath, shouldKeepInvitationLoginOpen } from "../post-logout";

/**
 * daodao#346：登出後要落在登入頁，並保留目前語系（localePrefix: "as-needed"，
 * 中文不帶前綴、英文帶 /en）。
 */
describe("getPostLogoutLoginPath", () => {
  it.each([
    ["/", "/auth/login"],
    ["/settings", "/auth/login"],
    ["/practices/123", "/auth/login"],
    ["/en", "/en/auth/login"],
    ["/en/", "/en/auth/login"],
    ["/en/settings", "/en/auth/login"],
    ["/en/practices/123", "/en/auth/login"],
  ])("%s → %s", (pathname, expected) => {
    expect(getPostLogoutLoginPath(pathname)).toBe(expected);
  });

  it("does not treat paths that merely start with 'en' as English", () => {
    expect(getPostLogoutLoginPath("/english-club")).toBe("/auth/login");
  });

  it.each([
    [
      "/organization-invitation",
      "/organization-invitation",
      "/auth/login?redirect=%2Forganization-invitation&reauth=1",
    ],
    [
      "/en/organization-invitation",
      "/en/organization-invitation",
      "/en/auth/login?redirect=%2Fen%2Forganization-invitation&reauth=1",
    ],
  ])("preserves the invitation return after logging out from %s", (pathname, returnPath, expected) => {
    expect(getPostLogoutLoginPath(pathname, returnPath)).toBe(expected);
  });

  it.each([
    "https://example.com/organization-invitation",
    "//example.com/organization-invitation",
    "/organization-invitation?token=secret",
    "/en/organization-invitation?token=secret",
    "/organization-invitation#token=secret",
    "/organization-invitation/../settings",
    "/organization-invitation%3Ftoken%3Dsecret",
    "/organization-invitation%0d%0aLocation:https://example.com",
    "/settings",
    "",
  ])("keeps unsafe or unrelated return %s out of the login URL", (returnPath) => {
    const loginPath = getPostLogoutLoginPath("/en/organization-invitation", returnPath);
    expect(loginPath).toBe("/en/auth/login");
    expect(loginPath).not.toContain("secret");
  });
});

describe("explicit invitation reauthentication", () => {
  it.each([
    "/organization-invitation",
    "/en/organization-invitation",
  ])("keeps fresh login available for %s despite an authenticated stale cookie", (returnPath) => {
    expect(shouldKeepInvitationLoginOpen(returnPath, "1")).toBe(true);
  });

  it.each([
    ["/organization-invitation", null],
    ["/organization-invitation", "0"],
    ["/organization-invitation", "true"],
    [null, "1"],
    ["/settings", "1"],
    ["https://example.com/organization-invitation", "1"],
    ["/organization-invitation?token=secret", "1"],
    ["/en/organization-invitation#token=secret", "1"],
  ])("retains ordinary authenticated login redirect for %s / %s", (returnPath, reauth) => {
    expect(shouldKeepInvitationLoginOpen(returnPath, reauth)).toBe(false);
  });
});
