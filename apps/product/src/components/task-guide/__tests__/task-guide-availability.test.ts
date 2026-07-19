import { describe, expect, it } from "vitest";
import { isTaskGuideAllowedPath, stripLocaleFromPathname } from "../task-guide-availability";

describe("task guide availability", () => {
  it.each([
    ["/", "/"],
    ["/zh-TW", "/"],
    ["/en/notifications", "/notifications"],
    ["/zh-TW/settings/account", "/settings/account"],
  ])("strips a supported locale from %s", (pathname, expected) => {
    expect(stripLocaleFromPathname(pathname)).toBe(expected);
  });

  it.each([
    "/",
    "/zh-TW",
    "/notifications",
    "/en/notifications",
    "/mine",
    "/zh-TW/settings/account",
  ])("allows %s", (pathname) => {
    expect(isTaskGuideAllowedPath(pathname)).toBe(true);
  });

  it.each([
    "/social",
    "/users/123",
    "/practices/create",
    "/zh-TW/resource",
  ])("rejects %s", (pathname) => {
    expect(isTaskGuideAllowedPath(pathname)).toBe(false);
  });
});
