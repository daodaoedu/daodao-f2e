import { describe, expect, it } from "vitest";
import { computeBodyDisplayLeft } from "../check-in-stack-utils";

describe("computeBodyDisplayLeft", () => {
  it("returns x minus half width minus wall thickness", () => {
    expect(computeBodyDisplayLeft(200, 80, 20)).toBe(120);
  });

  it("handles body at right edge of physics world", () => {
    // right wall at x=448, item width=80, wall thickness=20
    // body center at x=428 → left = 428 - 40 - 20 = 368
    expect(computeBodyDisplayLeft(428, 80, 20)).toBe(368);
  });

  it("handles body at left edge of physics world", () => {
    // left wall at x=20+40=60, item width=80, wall thickness=20
    // body center at x=60 → left = 60 - 40 - 20 = 0
    expect(computeBodyDisplayLeft(60, 80, 20)).toBe(0);
  });
});
