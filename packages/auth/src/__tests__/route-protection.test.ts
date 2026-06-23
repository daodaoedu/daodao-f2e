import { describe, expect, it } from "vitest";
import {
  isProtectedPath,
  matchesPath,
  removeLocalePrefix,
} from "../utils/route-protection";

const LOCALES = ["zh-TW", "en"];

describe("matchesPath", () => {
  it("matches exact root path", () => {
    expect(matchesPath("/", "^/$")).toBe(true);
  });

  it("matches pattern with trailing segments", () => {
    expect(matchesPath("/practices/abc123", "^/practices/[^/]+$")).toBe(true);
  });

  it("does not match when segment count exceeds pattern", () => {
    expect(matchesPath("/practices/abc/check-ins/xyz", "^/practices/[^/]+$")).toBe(false);
  });

  it("matches partial prefix pattern", () => {
    expect(matchesPath("/auth/login", "^/auth/")).toBe(true);
  });

  it("returns false for non-matching path", () => {
    expect(matchesPath("/mine", "^/practices/[^/]+$")).toBe(false);
  });

  it("returns false for invalid regex instead of throwing", () => {
    expect(matchesPath("/path", "[invalid")).toBe(false);
  });
});

describe("removeLocalePrefix", () => {
  it("removes zh-TW prefix", () => {
    expect(removeLocalePrefix("/zh-TW/practices/abc", LOCALES)).toBe("/practices/abc");
  });

  it("removes en prefix", () => {
    expect(removeLocalePrefix("/en/mine", LOCALES)).toBe("/mine");
  });

  it("returns '/' when only locale segment", () => {
    expect(removeLocalePrefix("/en", LOCALES)).toBe("/");
  });

  it("keeps path unchanged when no locale prefix", () => {
    expect(removeLocalePrefix("/practices/abc", LOCALES)).toBe("/practices/abc");
  });

  it("keeps path unchanged when first segment is not a locale", () => {
    expect(removeLocalePrefix("/admin/users", LOCALES)).toBe("/admin/users");
  });
});

describe("isProtectedPath", () => {
  const publicPattern = [
    "^/auth/",
    "^/$",
    "^/users/",
    "^/practices/[^/]+$",
    "^/practices/[^/]+/check-ins/",
  ];

  it("auth paths are not protected", () => {
    expect(
      isProtectedPath("/auth/login", { publicPattern, defaultProtected: true }, LOCALES)
    ).toBe(false);
  });

  it("root path is not protected", () => {
    expect(isProtectedPath("/", { publicPattern, defaultProtected: true }, LOCALES)).toBe(false);
  });

  it("practice detail page is not protected", () => {
    expect(
      isProtectedPath("/practices/abc123", { publicPattern, defaultProtected: true }, LOCALES)
    ).toBe(false);
  });

  it("check-in detail page is not protected", () => {
    expect(
      isProtectedPath(
        "/practices/abc/check-ins/xyz",
        { publicPattern, defaultProtected: true },
        LOCALES
      )
    ).toBe(false);
  });

  it("protected path with defaultProtected=true is protected", () => {
    expect(
      isProtectedPath("/settings", { publicPattern, defaultProtected: true }, LOCALES)
    ).toBe(true);
  });

  it("locale-prefixed public path is not protected", () => {
    expect(
      isProtectedPath(
        "/zh-TW/practices/abc123",
        { publicPattern, defaultProtected: true },
        LOCALES
      )
    ).toBe(false);
  });

  it("locale-prefixed protected path is protected", () => {
    expect(
      isProtectedPath("/en/settings", { publicPattern, defaultProtected: true }, LOCALES)
    ).toBe(true);
  });

  it("with defaultProtected=false, unlisted path is not protected", () => {
    expect(
      isProtectedPath("/random-page", { publicPattern: [], defaultProtected: false }, LOCALES)
    ).toBe(false);
  });

  it("protectedPattern takes precedence when provided", () => {
    expect(
      isProtectedPath(
        "/admin",
        { publicPattern: [], protectedPattern: ["^/admin"], defaultProtected: false },
        LOCALES
      )
    ).toBe(true);
  });
});
