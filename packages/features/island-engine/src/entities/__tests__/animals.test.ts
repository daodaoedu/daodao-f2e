import { describe, expect, it } from "vitest";
import { advanceAnimalWander, type IAnimalWanderState } from "../plants";

const state = (): IAnimalWanderState => ({
  x: 4,
  z: 1,
  heading: 0.4,
  phase: 1.2,
  speed: 0.8,
  minRadius: 2,
  maxRadius: 8,
  turnFrequencyA: 0.48,
  turnFrequencyB: 0.91,
});

describe("animal wandering", () => {
  it("is deterministic while producing a non-circular heading", () => {
    const first = advanceAnimalWander(state(), 0.2, 3.5);
    const second = advanceAnimalWander(state(), 0.2, 3.5);

    expect(first).toEqual(second);
    expect(first.heading).not.toBe(state().heading);
    expect(first.x).not.toBe(state().x);
    expect(first.z).not.toBe(state().z);
  });

  it("steers an animal back toward its activity area", () => {
    const outside = { ...state(), x: 12, z: 0, heading: 0 };
    let current = outside;
    for (let index = 0; index < 30; index++) {
      current = advanceAnimalWander(current, 0.1, index * 0.1);
    }

    expect(Math.hypot(current.x, current.z)).toBeLessThan(Math.hypot(outside.x, outside.z));
  });
});
