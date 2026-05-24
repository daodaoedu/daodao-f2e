import { describe, expect, it } from "vitest";
import { getElementCaptureDimensions } from "../capture-element-as-image";

describe("getElementCaptureDimensions", () => {
  it("returns scrollWidth/scrollHeight when they exceed client dimensions", () => {
    const el = { scrollWidth: 400, scrollHeight: 800, clientWidth: 350, clientHeight: 500 };
    expect(getElementCaptureDimensions(el)).toEqual({ width: 400, height: 800 });
  });

  it("returns clientWidth/clientHeight when scroll dimensions are equal", () => {
    const el = { scrollWidth: 350, scrollHeight: 500, clientWidth: 350, clientHeight: 500 };
    expect(getElementCaptureDimensions(el)).toEqual({ width: 350, height: 500 });
  });

  it("returns max of each dimension independently", () => {
    const el = { scrollWidth: 300, scrollHeight: 900, clientWidth: 400, clientHeight: 500 };
    expect(getElementCaptureDimensions(el)).toEqual({ width: 400, height: 900 });
  });

  it("handles element with zero scroll dimensions (not rendered)", () => {
    const el = { scrollWidth: 0, scrollHeight: 0, clientWidth: 350, clientHeight: 500 };
    expect(getElementCaptureDimensions(el)).toEqual({ width: 350, height: 500 });
  });

  it("handles square elements without overflow", () => {
    const el = { scrollWidth: 200, scrollHeight: 200, clientWidth: 200, clientHeight: 200 };
    expect(getElementCaptureDimensions(el)).toEqual({ width: 200, height: 200 });
  });
});
