import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const fixture = vi.hoisted(() => ({
  params: new URLSearchParams(),
  authenticated: true,
  validState: true,
  redirect: "",
  openLoginDialog: vi.fn(),
}));
vi.mock("@daodao/auth", () => ({
  useAuth: () => ({
    openLoginDialog: fixture.openLoginDialog,
    isAuthenticated: fixture.authenticated,
    isLoading: false,
  }),
}));
vi.mock("@daodao/i18n", () => ({ useTranslations: () => (key: string) => key }));
vi.mock("next/navigation", () => ({ useSearchParams: () => fixture.params }));
vi.mock("react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react")>()),
  useEffect: (effect: () => void) => effect(),
}));
vi.mock("@daodao/shared", () => ({
  getStorage: () => ({ set: vi.fn() }),
  StorageEnum: { AuthSignal: "auth-signal" },
}));
vi.mock("../../../../../../packages/auth/src/lib/auth-client", () => ({
  decodeOAuthState: () => ({ redirectUrl: fixture.redirect }),
  verifyAndConsumeOAuthState: () => fixture.validState,
}));

import { useRedirectAfterLogin } from "../../../../../../packages/auth/src/hooks/use-redirect-after-login";
import LoginPage from "../../../app/[locale]/auth/login/page";

const unsafe = [
  "https://example.com",
  "//example.com",
  "/\\example.com",
  "\\\\example.com",
  "javascript:alert(1)",
  "/\t/example.com",
  "/\n/example.com",
  "/%2fexample.com",
  "/%255cexample.com",
  "/%09/example.com",
  "/%00example.com",
];

beforeEach(() => {
  fixture.params = new URLSearchParams();
  fixture.authenticated = true;
  fixture.validState = true;
  fixture.openLoginDialog.mockClear();
  vi.stubGlobal("window", { location: { href: "" } });
});
afterEach(() => vi.unstubAllGlobals());

describe("login destination", () => {
  it.each(unsafe)("rejects %j for an authenticated visitor", (redirect) => {
    fixture.params.set("redirect", redirect);
    LoginPage();
    expect(window.location.href).toBe("/");
  });
  it("preserves a site path including its query and fragment", () => {
    const redirect = "/lighthouse/programs?edit=1#details";
    fixture.params.set("redirect", redirect);
    LoginPage();
    expect(window.location.href).toBe(redirect);
  });
  it.each(unsafe)("passes a safe destination to the login dialog for %j", (redirect) => {
    fixture.authenticated = false;
    fixture.params.set("redirect", redirect);
    LoginPage();
    expect(fixture.openLoginDialog).toHaveBeenCalledWith({
      redirectUrl: "/",
      source: "app",
      dismissible: false,
    });
    expect(window.location.href).toBe("");
  });
});

describe("OAuth callback destination", () => {
  it.each(unsafe)("rejects %j even with a valid OAuth state", (redirect) => {
    fixture.redirect = redirect;
    fixture.params.set("state", "validated-state");
    useRedirectAfterLogin();
    expect(window.location.href).toBe("/");
  });
  it("preserves a valid internal return path", () => {
    fixture.redirect = "/lighthouse/programs?edit=1";
    fixture.params.set("state", "validated-state");
    useRedirectAfterLogin();
    expect(window.location.href).toBe(fixture.redirect);
  });
  it("keeps onboarding for a new user with valid state", () => {
    fixture.params.set("state", "validated-state");
    fixture.redirect = "https://example.com";
    fixture.params.set("isNewUser", "true");
    useRedirectAfterLogin();
    expect(window.location.href).toBe("/auth/onboarding");
  });
  it("ignores the redirect when OAuth state verification fails", () => {
    fixture.validState = false;
    fixture.redirect = "/lighthouse/programs?edit=1";
    fixture.params.set("state", "invalid-state");
    useRedirectAfterLogin();
    expect(window.location.href).toBe("/");
  });
});
