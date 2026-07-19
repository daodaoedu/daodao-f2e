import { describe, expect, it } from "vitest";
import { generateTerrain, sampleTerrainHeight } from "../../terrain/generate";
import type { IIslandDestination } from "../../types";
import {
  computeRoutePlacements,
  createRoutesGroup,
  findNearestDestination,
  MAX_ROUTE_BEACONS,
  NEIGHBOR_ISLAND_DISTANCE,
  ROUTE_BOAT_START_X,
  ROUTE_BOAT_START_Z,
  ROUTE_DESTINATION_MIN_SPACING,
  ROUTE_INTERACT_RADIUS,
} from "../routes";

const destinations: IIslandDestination[] = Array.from(
  { length: MAX_ROUTE_BEACONS + 2 },
  (_, index) => ({
    identifier: `dao-${index}`,
    name: `Island ${index}`,
    photoUrl: null,
  })
);

const harborLocalToWorld = (
  placement: ReturnType<typeof computeRoutePlacements>[number],
  localX: number,
  localZ: number
) => {
  const cosine = Math.cos(placement.rotationY);
  const sine = Math.sin(placement.rotationY);
  return {
    x: placement.x + cosine * localX + sine * localZ,
    z: placement.z - sine * localX + cosine * localZ,
  };
};

const destinationWorldPosition = (placement: ReturnType<typeof computeRoutePlacements>[number]) =>
  harborLocalToWorld(placement, placement.destinationX, placement.destinationZ);

describe("island routes", () => {
  it("creates an empty route group without adding an undefined child", () => {
    const group = createRoutesGroup([]);

    expect(group.name).toBe("island-routes");
    expect(group.children).toHaveLength(0);
  });

  it("places a deterministic, bounded set of route beacons", () => {
    const terrain = generateTerrain("route-test", "D");
    const first = computeRoutePlacements(terrain, destinations);
    const second = computeRoutePlacements(terrain, destinations);

    expect(first).toEqual(second);
    expect(first).toHaveLength(MAX_ROUTE_BEACONS);
    expect(first.map((placement) => placement.identifier)).toEqual(
      destinations.slice(0, MAX_ROUTE_BEACONS).map((destination) => destination.identifier)
    );
    expect(first.every((placement) => placement.y > 0)).toBe(true);
  });

  it("places every route at one shared harbor while keeping destination islands separate", () => {
    const terrain = generateTerrain("route-test", "D");
    const placements = computeRoutePlacements(terrain, destinations);
    const [harbor] = placements;

    expect(harbor).toBeDefined();
    if (!harbor) return;
    expect(
      placements.every(
        (placement) =>
          placement.x === harbor.x &&
          placement.y === harbor.y &&
          placement.z === harbor.z &&
          placement.interactX === harbor.interactX &&
          placement.interactZ === harbor.interactZ &&
          placement.rotationY === harbor.rotationY
      )
    ).toBe(true);
    expect(
      new Set(placements.map((placement) => `${placement.destinationX}:${placement.destinationZ}`))
        .size
    ).toBe(MAX_ROUTE_BEACONS);
  });

  it("scatters destination islands around the current island at different distances", () => {
    const terrain = generateTerrain("route-test", "D");
    const placements = computeRoutePlacements(terrain, destinations);
    const angles = placements
      .map((placement) => {
        const worldPosition = destinationWorldPosition(placement);
        const angle = Math.atan2(worldPosition.x, worldPosition.z);
        return angle < 0 ? angle + Math.PI * 2 : angle;
      })
      .sort((first, second) => first - second);
    const circularGaps = angles.map((angle, index) => {
      const nextAngle = angles[(index + 1) % angles.length] ?? angle;
      return index === angles.length - 1 ? nextAngle + Math.PI * 2 - angle : nextAngle - angle;
    });
    const roundedDistances = new Set(
      placements.map((placement) => {
        const worldPosition = destinationWorldPosition(placement);
        return Math.round(Math.hypot(worldPosition.x, worldPosition.z));
      })
    );

    expect(Math.max(...circularGaps)).toBeLessThan(Math.PI / 2);
    expect(roundedDistances.size).toBeGreaterThan(5);
  });

  it("keeps every destination island outside the current island in world space", () => {
    const terrain = generateTerrain("route-test", "D");
    const placements = computeRoutePlacements(terrain, destinations);

    for (const placement of placements) {
      const worldPosition = destinationWorldPosition(placement);
      expect(Math.hypot(worldPosition.x, worldPosition.z)).toBeGreaterThanOrEqual(
        terrain.theme.islandRadius + NEIGHBOR_ISLAND_DISTANCE
      );
    }
  });

  it("keeps scattered destination islands from overlapping", () => {
    const terrain = generateTerrain("route-test", "D");
    const placements = computeRoutePlacements(terrain, destinations);

    for (const [index, placement] of placements.entries()) {
      for (const other of placements.slice(index + 1)) {
        expect(
          Math.hypot(
            placement.destinationX - other.destinationX,
            placement.destinationZ - other.destinationZ
          )
        ).toBeGreaterThanOrEqual(ROUTE_DESTINATION_MIN_SPACING);
      }
    }
  });

  it("keeps the destination shore far enough away for a player-controlled voyage", () => {
    const terrain = generateTerrain("route-test", "D");
    const [placement] = computeRoutePlacements(terrain, destinations);

    expect(placement).toBeDefined();
    if (!placement) return;
    expect(terrain.theme.islandRadius + NEIGHBOR_ISLAND_DISTANCE).toBeGreaterThan(
      ROUTE_BOAT_START_Z + 20
    );
    expect(Math.hypot(placement.dockX, placement.dockZ) - ROUTE_BOAT_START_Z).toBeGreaterThan(15);
  });

  it("places the boarding boat beyond the terrain waterline", () => {
    const terrain = generateTerrain("route-test", "D");
    const [placement] = computeRoutePlacements(terrain, destinations);

    expect(placement).toBeDefined();
    if (!placement) return;
    const boatPosition = harborLocalToWorld(placement, ROUTE_BOAT_START_X, ROUTE_BOAT_START_Z);
    expect(sampleTerrainHeight(terrain, boatPosition.x, boatPosition.z)).toBeLessThanOrEqual(-0.15);
  });

  it("keeps the harbor interaction and disembark point on walkable terrain", () => {
    const terrain = generateTerrain("route-test", "D");
    const [placement] = computeRoutePlacements(terrain, destinations);

    expect(placement).toBeDefined();
    if (!placement) return;
    expect(sampleTerrainHeight(terrain, placement.interactX, placement.interactZ)).toBeGreaterThan(
      0.12
    );
    expect(
      Math.hypot(placement.interactX - placement.x, placement.interactZ - placement.z)
    ).toBeLessThan(12);
    const interactionDistance = Math.hypot(placement.interactX, placement.interactZ);
    const safeApproachDistance = interactionDistance - ROUTE_INTERACT_RADIUS / 2;
    const safeApproachX = (placement.interactX / interactionDistance) * safeApproachDistance;
    const safeApproachZ = (placement.interactZ / interactionDistance) * safeApproachDistance;
    expect(sampleTerrainHeight(terrain, safeApproachX, safeApproachZ)).toBeGreaterThan(0.12);
    expect(findNearestDestination([placement], safeApproachX, safeApproachZ)).toBe(
      placement.identifier
    );
  });

  it("finds the shared harbor only when the character is nearby", () => {
    const terrain = generateTerrain("route-test", "D");
    const [placement] = computeRoutePlacements(terrain, destinations);

    expect(placement).toBeDefined();
    if (!placement) return;

    expect(findNearestDestination([placement], placement.interactX, placement.interactZ)).toBe(
      placement.identifier
    );
    expect(findNearestDestination([placement], 0, 0, 1)).toBeNull();
  });
});
