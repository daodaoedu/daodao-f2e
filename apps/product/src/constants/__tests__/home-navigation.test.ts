import { describe, expect, it } from "vitest";
import { HOME_TAB_PATHS } from "../home-navigation";

describe("home tab navigation paths", () => {
  it("inspire tab uses root path", () => {
    expect(HOME_TAB_PATHS.inspire).toBe("/");
  });

  it("mine tab uses /my path", () => {
    expect(HOME_TAB_PATHS.mine).toBe("/my");
  });
});
