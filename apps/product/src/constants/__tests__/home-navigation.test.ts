import { describe, expect, it } from "vitest";
import { HOME_TAB_ORDER, HOME_TAB_PATHS } from "../home-navigation";

describe("home tab navigation paths", () => {
  it("inspire tab uses root path", () => {
    expect(HOME_TAB_PATHS.inspire).toBe("/");
  });

  it("persona tab uses /persona path", () => {
    expect(HOME_TAB_PATHS.persona).toBe("/persona");
  });

  it("mine tab uses /mine path", () => {
    expect(HOME_TAB_PATHS.mine).toBe("/mine");
  });
});

describe("home tab order", () => {
  it("first tab is inspire", () => {
    expect(HOME_TAB_ORDER[0]).toBe("inspire");
  });

  it("second tab is mine (not persona)", () => {
    expect(HOME_TAB_ORDER[1]).toBe("mine");
    expect(HOME_TAB_ORDER[1]).not.toBe("persona");
  });

  it("third tab is persona", () => {
    expect(HOME_TAB_ORDER[2]).toBe("persona");
  });

  it("contains all three tabs", () => {
    expect(HOME_TAB_ORDER).toHaveLength(3);
    expect(HOME_TAB_ORDER).toContain("inspire");
    expect(HOME_TAB_ORDER).toContain("mine");
    expect(HOME_TAB_ORDER).toContain("persona");
  });
});
