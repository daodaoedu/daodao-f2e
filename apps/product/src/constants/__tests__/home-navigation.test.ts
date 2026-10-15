import { describe, expect, it } from "vitest";
import { HOME_TAB_PATHS, PRACTICE_DETAIL_CLOSE_PATH } from "../home-navigation";

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

describe("practice detail close path", () => {
  it("closes to the new home page, not legacy /mine (daodao#211)", () => {
    expect(PRACTICE_DETAIL_CLOSE_PATH).toBe("/");
  });
});
