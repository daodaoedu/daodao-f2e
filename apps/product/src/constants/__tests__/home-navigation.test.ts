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
  it("should have the correct canonical order", () => {
    expect(HOME_TAB_ORDER).toEqual(["inspire", "mine", "persona"]);
  });
});
