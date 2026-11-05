import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  mode: "template",
  auth: { isLoading: false, isAuthenticated: true, isTemporary: false, roles: ["normal_student"] },
}));
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams({ mode: state.mode }),
}));
vi.mock("@daodao/auth", () => ({ useAuth: () => ({ ...state.auth, openLoginDialog: vi.fn() }) }));
vi.mock("@daodao/i18n", () => ({ useTranslations: () => (key: string) => key }));
vi.mock("@daodao/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) =>
    createElement("a", { href }, children),
}));
vi.mock("@daodao/ui/components/button", () => ({
  Button: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) =>
    asChild ? children : createElement("button", { type: "button" }, children),
}));
vi.mock("@/components/practice/create/wizard", () => ({
  WizardMode: { template: "template", personal: "personal" },
  PracticeWizard: ({ mode }: { mode: string }) =>
    createElement("form", null, `${mode} creation form`),
}));

import Page from "../page";

const render = () => renderToStaticMarkup(createElement(Page));

beforeEach(() => {
  state.mode = "template";
  state.auth = {
    isLoading: false,
    isAuthenticated: true,
    isTemporary: false,
    roles: ["normal_student"],
  };
});

describe("official template creation entry", () => {
  it("withholds the form while authentication is loading", () => {
    state.auth.isLoading = true;
    expect(render()).not.toContain("creation form");
    expect(render()).toContain("loading");
  });
  it("withholds visitors while the global provider redirects to login", () => {
    state.auth.isAuthenticated = false;
    expect(render()).not.toContain("creation form");
    expect(render()).not.toContain("template_access_login");
    expect(render()).not.toContain('href="/practices/create/manual"');
  });
  it.each([
    "normal_student",
    "organization_admin",
    "notadmin",
  ])("denies %s before showing the form", (role) => {
    state.auth.roles = [role];
    expect(render()).not.toContain("creation form");
    expect(render()).toContain("template_access_denied");
  });
  it("denies temporary users even if they carry administrator roles", () => {
    state.auth.isTemporary = true;
    state.auth.roles = ["admin"];
    expect(render()).not.toContain("creation form");
  });
  it.each(["admin", "superadmin", "super_admin", "ADMIN"])("allows %s", (role) => {
    state.auth.roles = [role];
    expect(render()).toContain("template creation form");
  });
  it("preserves personal practice creation for ordinary users", () => {
    state.mode = "personal";
    expect(render()).toContain("personal creation form");
  });
});
