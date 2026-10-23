import { describe, expect, it, vi } from "vitest";
import { checkPrivateSession, isPrivateSpacePath } from "../private-access";

describe("private space route boundaries", () => {
  it.each([
    "/spaces",
    "/en/spaces",
    "/spaces/personal",
    "/en/spaces/challenge",
    "/spaces/123",
    "/zh-TW/spaces/personal",
  ])("requires a session for %s", (path) => {
    expect(isPrivateSpacePath(path)).toBe(true);
  });
  it.each([
    "/",
    "/activities",
    "/spaces/public/token",
    "/en/spaces/public/token",
    "/spaceship",
  ])("keeps public route %s public", (path) => {
    expect(isPrivateSpacePath(path)).toBe(false);
  });
});

describe("private session check", () => {
  it("does not fetch for guests", async () => {
    const request = vi.fn();
    expect(await checkPrivateSession(undefined, "https://api.example", request)).toBe(
      "unauthorized"
    );
    expect(request).not.toHaveBeenCalled();
  });
  it("forwards only session cookie and disables caching", async () => {
    const request = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ data: { user: { id: "user-a" }, isTemporary: false } }))
      );
    expect(await checkPrivateSession("session", "https://api.example/", request)).toBe("allowed");
    expect(request).toHaveBeenCalledWith(
      "https://api.example/api/v1/auth/me",
      expect.objectContaining({ headers: { Cookie: "auth_token=session" }, cache: "no-store" })
    );
  });
  it("expired sessions must log in", async () => {
    expect(
      await checkPrivateSession(
        "expired",
        "https://api.example",
        vi.fn().mockResolvedValue(new Response(null, { status: 401 }))
      )
    ).toBe("unauthorized");
  });
  it.each([
    {},
    { data: {} },
    { data: { user: null } },
  ])("malformed successful response is unavailable", async (payload) => {
    expect(
      await checkPrivateSession(
        "session",
        "https://api.example",
        vi.fn().mockResolvedValue(new Response(JSON.stringify(payload)))
      )
    ).toBe("unavailable");
  });
  it("temporary accounts cannot enter private spaces", async () => {
    expect(
      await checkPrivateSession(
        "session",
        "https://api.example",
        vi
          .fn()
          .mockResolvedValue(
            new Response(JSON.stringify({ data: { user: { id: "temp" }, isTemporary: true } }))
          )
      )
    ).toBe("unauthorized");
  });
  it.each([403, 500, 503])("HTTP %s must not become logout", async (status) => {
    expect(
      await checkPrivateSession(
        "session",
        "https://api.example",
        vi.fn().mockResolvedValue(new Response(null, { status }))
      )
    ).toBe("unavailable");
  });
  it("network failure must not become logout", async () => {
    expect(
      await checkPrivateSession(
        "session",
        "https://api.example",
        vi.fn().mockRejectedValue(new Error("offline"))
      )
    ).toBe("unavailable");
  });
});
