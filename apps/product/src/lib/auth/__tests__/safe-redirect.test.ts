import { getSafeLoginRedirect } from "@daodao/auth/lib/safe-redirect";
import { describe, expect, it } from "vitest";

describe("login returns only to safe private destinations", () => {
  it.each([
    "/en/spaces/personal?tab=active",
    "/lighthouse/organization?organizationId=2",
    "/spaces/共同學習",
    "/en/settings/account",
  ])("preserves %s", (path) => {
    expect(getSafeLoginRedirect(path)).toBe(path);
  });
  it.each([
    undefined,
    "",
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    "/%2fevil.example",
    "/%255cevil.example",
    "/\nevil.example",
    "/en/auth/login?redirect=/spaces",
    "/auth/callback",
    "/auth/error",
    "/en/../auth/login",
  ])("rejects unsafe or looping destination %s", (path) => {
    expect(getSafeLoginRedirect(path)).toBe("/");
  });
});
