import { getSafeLoginRedirect } from "@daodao/auth/lib/safe-redirect";
import { describe, expect, it } from "vitest";

describe("safe login redirect", () => {
  it.each([
    "/",
    "/en/spaces/personal?tab=active",
    "/lighthouse/organization?organizationId=2",
    "/en/settings/account",
    "/lighthouse/programs?edit=1#details",
    "/spaces/共同學習",
    "/spaces/%E5%AD%B8%E7%BF%92?query=100%25&next=https%3A%2F%2Fexample.com",
    "/search?q=%5Cexample.com",
    "/progress/100%25",
  ])("preserves the complete internal URL %j", (path) => {
    expect(getSafeLoginRedirect(path)).toBe(path);
  });
  it.each([
    undefined,
    null,
    "",
    "relative/path",
    "https://example.com",
    "//example.com",
    "/\\example.com",
    "/%2fexample.com",
    "/%255cexample.com",
    "/%09/example.com",
    "javascript:alert(1)",
    "/en/auth/login?redirect=/spaces",
    "/auth/callback",
    "/auth/error",
    "/auth/access-unavailable",
    "/zh-TW/auth/access-unavailable?redirect=/spaces",
    "/en/../auth/login",
    "/en/%61uth/login",
    "/en/auth/%256cogin",
  ])("falls back to home for %j", (path) => {
    expect(getSafeLoginRedirect(path)).toBe("/");
  });
});
