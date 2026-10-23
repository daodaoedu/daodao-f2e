import { describe, expect, it } from "vitest";
import { getPostLogoutLoginPath } from "../post-logout";

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
});
