import { describe, expect, it } from "vitest";
import { getElementCaptureDimensions } from "../capture-element-as-image";

describe("getElementCaptureDimensions", () => {
  it("returns scrollWidth/scrollHeight when they exceed client dimensions (no border)", () => {
    const el = {
      scrollWidth: 400,
      scrollHeight: 800,
      clientWidth: 350,
      clientHeight: 500,
      offsetWidth: 350,
      offsetHeight: 500,
    };
    expect(getElementCaptureDimensions(el)).toEqual({ width: 400, height: 800 });
  });

  it("returns clientWidth/clientHeight when scroll dimensions are equal (no border)", () => {
    const el = {
      scrollWidth: 350,
      scrollHeight: 500,
      clientWidth: 350,
      clientHeight: 500,
      offsetWidth: 350,
      offsetHeight: 500,
    };
    expect(getElementCaptureDimensions(el)).toEqual({ width: 350, height: 500 });
  });

  it("returns max of each dimension independently (no border)", () => {
    const el = {
      scrollWidth: 300,
      scrollHeight: 900,
      clientWidth: 400,
      clientHeight: 500,
      offsetWidth: 400,
      offsetHeight: 500,
    };
    expect(getElementCaptureDimensions(el)).toEqual({ width: 400, height: 900 });
  });

  it("handles element with zero scroll dimensions (not rendered)", () => {
    const el = {
      scrollWidth: 0,
      scrollHeight: 0,
      clientWidth: 350,
      clientHeight: 500,
      offsetWidth: 350,
      offsetHeight: 500,
    };
    expect(getElementCaptureDimensions(el)).toEqual({ width: 350, height: 500 });
  });

  it("handles square elements without overflow or border", () => {
    const el = {
      scrollWidth: 200,
      scrollHeight: 200,
      clientWidth: 200,
      clientHeight: 200,
      offsetWidth: 200,
      offsetHeight: 200,
    };
    expect(getElementCaptureDimensions(el)).toEqual({ width: 200, height: 200 });
  });

  it("adds border thickness to scroll dimensions when element has borders", () => {
    // borderWidth = offsetWidth - clientWidth = 360 - 350 = 10
    // borderHeight = offsetHeight - clientHeight = 510 - 500 = 10
    const el = {
      scrollWidth: 400,
      scrollHeight: 800,
      clientWidth: 350,
      clientHeight: 500,
      offsetWidth: 360,
      offsetHeight: 510,
    };
    expect(getElementCaptureDimensions(el)).toEqual({ width: 410, height: 810 });
  });

  it("returns offsetWidth/offsetHeight when scroll + border is smaller", () => {
    // borderWidth = 20, scrollWidth + borderWidth = 100 + 20 = 120 < offsetWidth = 150
    const el = {
      scrollWidth: 100,
      scrollHeight: 100,
      clientWidth: 130,
      clientHeight: 130,
      offsetWidth: 150,
      offsetHeight: 150,
    };
    expect(getElementCaptureDimensions(el)).toEqual({ width: 150, height: 150 });
  });
});
