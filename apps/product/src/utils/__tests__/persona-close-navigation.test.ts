import { describe, expect, it } from "vitest";
import { resolvePersonaCloseTarget } from "../persona-close-navigation";

describe("resolvePersonaCloseTarget", () => {
  it("uses back action when history is available", () => {
    expect(resolvePersonaCloseTarget(true)).toEqual({ action: "back" });
  });

  it("navigates to /persona when no history", () => {
    expect(resolvePersonaCloseTarget(false)).toEqual({ action: "push", path: "/persona" });
  });

  it("does not use /?tab=persona pattern (regression guard)", () => {
    const fallback = resolvePersonaCloseTarget(false);
    expect(fallback).not.toEqual({ action: "push", path: "/?tab=persona" });
  });
});
