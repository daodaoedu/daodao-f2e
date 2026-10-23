import { classifySessionResponse } from "@daodao/auth/lib/session-response";
import { describe, expect, it } from "vitest";

describe("session responses distinguish logout from service failure", () => {
  const user = { data: { user: { id: "user-a" }, isTemporary: false } };
  it("accepts a verified user response", () => {
    expect(classifySessionResponse(200, user)).toBe("authenticated");
  });
  it("preserves temporary-user handling for onboarding", () => {
    expect(
      classifySessionResponse(200, { data: { user: { id: "temp" }, isTemporary: true } })
    ).toBe("authenticated");
  });
  it("only a 401 response establishes an invalid session", () => {
    expect(classifySessionResponse(401, user)).toBe("unauthorized");
  });
  it.each([403, 429, 500, 503])("HTTP %s cannot log the user out", (status) => {
    expect(classifySessionResponse(status, user)).toBe("unavailable");
  });
  it.each([
    undefined,
    {},
    { data: {} },
    { data: { user: null } },
  ])("malformed success cannot log the user out", (payload) => {
    expect(classifySessionResponse(200, payload)).toBe("unavailable");
  });
});
