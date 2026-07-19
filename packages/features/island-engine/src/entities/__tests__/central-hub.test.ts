import { Group } from "three";
import { describe, expect, it } from "vitest";
import type { IAssetLoader } from "../../assets/loader";
import { generateTerrain, sampleTerrainHeight } from "../../terrain/generate";
import {
  CENTRAL_HUB_CLEAR_RADIUS,
  computeCentralHubPlacements,
  createCentralHub,
} from "../central-hub";

describe("central island hub", () => {
  it("keeps the spawn clear while filling the visible center", () => {
    const terrain = generateTerrain("central-hub", "D");
    const placements = computeCentralHubPlacements(terrain);

    expect(placements.length).toBeGreaterThanOrEqual(16);
    expect(new Set(placements.map((placement) => placement.key)).size).toBeGreaterThanOrEqual(10);
    for (const placement of placements) {
      expect(Math.hypot(placement.x, placement.z)).toBeGreaterThan(CENTRAL_HUB_CLEAR_RADIUS);
      expect(sampleTerrainHeight(terrain, placement.x, placement.z)).toBeGreaterThan(0.2);
    }
  });

  it("exposes only the existing flag asset as the owner interaction target", async () => {
    const loader: IAssetLoader = {
      load: async (key) => {
        const asset = new Group();
        asset.name = key;
        return asset;
      },
      dispose: () => undefined,
    };

    const hub = await createCentralHub(loader, generateTerrain("owner-target", "D"));

    expect(hub.ownerTarget).not.toBeNull();
    expect(hub.ownerTarget?.userData.isOwnerProfile).toBe(true);
    expect(
      hub.group.children.filter((child) => child.userData.isOwnerProfile === true)
    ).toHaveLength(1);
  });
});
