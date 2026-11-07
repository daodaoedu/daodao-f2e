import { describe, expect, it } from "vitest";
import { getRawAuthTokenCookie } from "../auth-cookie";

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
