import { describe, expect, it } from "vitest";
import {
  advanceBoatPose,
  BOAT_FORWARD_SPEED,
  didBoatReachDock,
  type IBoatNavigationBounds,
  type IBoatPose,
} from "../boat-navigation";

const bounds: IBoatNavigationBounds = {
  minX: -8,
  maxX: 8,
  minZ: 4,
  maxZ: 24,
};
const start: IBoatPose = { x: 0, z: 4, heading: 0 };

describe("boat navigation", () => {
  it("stays still without movement input", () => {
    expect(advanceBoatPose(start, { moveX: 0, moveZ: 0 }, 1, bounds)).toEqual(start);
  });

  it("rows forward at the configured speed", () => {
    const next = advanceBoatPose(start, { moveX: 0, moveZ: -1 }, 1, bounds);

    expect(next.x).toBe(0);
    expect(next.z).toBeCloseTo(start.z + BOAT_FORWARD_SPEED);
  });

  it("steers while moving and remains inside the route corridor", () => {
    const next = advanceBoatPose(start, { moveX: 1, moveZ: -1 }, 20, bounds);

    expect(next.heading).toBeGreaterThan(0);
    expect(next.x).toBe(bounds.maxX);
    expect(next.z).toBeLessThanOrEqual(bounds.maxZ);
  });

  it("detects entering the docking radius", () => {
    expect(
      didBoatReachDock(
        { x: 0, z: 18, heading: 0 },
        { x: 0, z: 21, heading: 0 },
        { x: 0, z: 22, radius: 1.5 }
      )
    ).toBe(true);
  });

  it("detects a dock crossed in one large frame", () => {
    expect(
      didBoatReachDock(
        { x: 0, z: 18, heading: 0 },
        { x: 0, z: 26, heading: 0 },
        { x: 0, z: 22, radius: 1 }
      )
    ).toBe(true);
  });

  it("does not dock while sailing outside the approach lane", () => {
    expect(
      didBoatReachDock(
        { x: 4, z: 18, heading: 0 },
        { x: 4, z: 24, heading: 0 },
        { x: 0, z: 22, radius: 1.5 }
      )
    ).toBe(false);
  });
});
