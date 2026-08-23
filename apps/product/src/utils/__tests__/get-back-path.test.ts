import { describe, expect, it } from "vitest";
import { getBackPath } from "../get-back-path";

describe("getBackPath", () => {
  it("returns inspire path when from=inspire", () => {
    expect(getBackPath("inspire")).toBe("/");
  });

  it("returns mine path when from=mine", () => {
    expect(getBackPath("mine")).toBe("/mine");
  });

  it("returns mine path when from is null", () => {
    expect(getBackPath(null)).toBe("/mine");
  });

  it("returns persona path when from=persona", () => {
    expect(getBackPath("persona")).toBe("/persona");
  });

  it("returns mine path when from is an unknown value", () => {
    expect(getBackPath("unknown-tab")).toBe("/mine");
  });
});
