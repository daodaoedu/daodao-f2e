import { describe, expect, it } from "vitest";
import { getHomeGuestLoginRedirect } from "../home-guest-login";

const guest = {
  isLoading: false,
  isAuthenticated: false,
  isMobile: true,
  hasPrompted: false,
  searchParams: new URLSearchParams(),
};

describe("mobile homepage guest login prompt", () => {
  it("prompts a mobile guest after authentication finishes", () => {
    expect(getHomeGuestLoginRedirect(guest)).toBe("/");
  });

  it.each([
    { isLoading: true },
    { isAuthenticated: true },
    { isMobile: false },
  ])("does not prompt outside an eligible mobile guest visit: %j", (state) => {
    expect(getHomeGuestLoginRedirect({ ...guest, ...state })).toBeNull();
  });

  it("does not reopen a dismissed prompt after an auth recheck or viewport change", () => {
    const alreadyPrompted = { ...guest, hasPrompted: true };
    expect(getHomeGuestLoginRedirect({ ...alreadyPrompted, isLoading: true })).toBeNull();
    expect(getHomeGuestLoginRedirect(alreadyPrompted)).toBeNull();
    expect(getHomeGuestLoginRedirect({ ...alreadyPrompted, isMobile: false })).toBeNull();
    expect(getHomeGuestLoginRedirect(alreadyPrompted)).toBeNull();
  });

  it("does not open a dialog when the legacy mine URL is about to redirect", () => {
    expect(
      getHomeGuestLoginRedirect({
        ...guest,
        searchParams: new URLSearchParams("tab=mine&keyword=english"),
      })
    ).toBeNull();
  });

  it("preserves all homepage query parameters in the login return URL", () => {
    expect(
      getHomeGuestLoginRedirect({
        ...guest,
        searchParams: new URLSearchParams("keyword=english&tags=reading&spaces=one&spaces=two"),
      })
    ).toBe("/?keyword=english&tags=reading&spaces=one&spaces=two");
  });
});
