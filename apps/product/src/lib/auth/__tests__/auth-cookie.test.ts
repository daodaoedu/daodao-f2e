import { afterEach, describe, expect, it, vi } from "vitest";
import { authCookieHeader, getAuthCookieName, getRawAuthTokenCookie } from "../auth-cookie";

describe("API-compatible auth cookie selection", () => {
  it.each([
    [null, undefined],
    ["other=value", undefined],
    ["auth_token=first", "first"],
    ["other=value; auth_token=first; auth_token=second", "first"],
    ["auth_token=second; auth_token=first", "second"],
    ["auth_token=; auth_token=second", ""],
    [" auth_token = encoded%2Etoken%3D ; other=value", "encoded%2Etoken%3D"],
    ['auth_token="quoted.token"', '"quoted.token"'],
    ["auth_token=literal%broken", "literal%broken"],
    ["auth_token=first%3B%20auth_token%3Dsecond", "first%3B%20auth_token%3Dsecond"],
    ["\tauth_token\t=\tfirst\t; auth_token=second", "first"],
    ["\u00a0auth_token=wrong; auth_token=right", "right"],
    ["auth_token=\u00a0first\u00a0", "\u00a0first\u00a0"],
    ["other_auth_token=wrong; auth_token=right", "right"],
  ])("selects the API's session from %s", (header, expected) => {
    expect(getRawAuthTokenCookie(header)).toBe(expected);
  });
});

// daodaoedu/daodao#526：dev 與正式站共用 .daodao.so，各自用自己的 Cookie 名稱
describe("environment-scoped auth cookie", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("uses auth_token when AUTH_COOKIE_NAME is not set", () => {
    vi.stubEnv("AUTH_COOKIE_NAME", "");
    expect(getAuthCookieName()).toBe("auth_token");
    expect(authCookieHeader("t")).toBe("auth_token=t");
  });

  it("reads only this environment's cookie and ignores the other environment's", () => {
    vi.stubEnv("AUTH_COOKIE_NAME", "auth_token_dev");
    expect(getRawAuthTokenCookie("auth_token=prod; auth_token_dev=dev")).toBe("dev");
    expect(getRawAuthTokenCookie("auth_token=prod")).toBeUndefined();
  });

  it("forwards the session to the API under this environment's name", () => {
    vi.stubEnv("AUTH_COOKIE_NAME", "auth_token_dev");
    expect(authCookieHeader("dev")).toBe("auth_token_dev=dev");
  });

  it("rejects a name that would break the Cookie header", () => {
    vi.stubEnv("AUTH_COOKIE_NAME", "auth token;");
    expect(() => getAuthCookieName()).toThrow("AUTH_COOKIE_NAME");
  });
});
