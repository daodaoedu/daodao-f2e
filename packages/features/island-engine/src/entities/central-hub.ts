import { Group, type Object3D, PointLight } from "three";
import type { IAssetLoader } from "../assets/loader";
import { ISLAND_ASSETS, type IslandAssetKeyType } from "../assets/manifest";
import type { IRadialCollider } from "../physics/ground";
import { type ITerrainData, sampleTerrainHeight } from "../terrain/generate";

export const CENTRAL_HUB_CLEAR_RADIUS = 3.5;

export interface ICentralHubPlacement {
  key: IslandAssetKeyType;
  x: number;
  y: number;
  z: number;
  scale: number;
  rotationY: number;
  colliderRadius?: number;
}

export interface ICentralHubResult {
  group: Group;
  colliders: IRadialCollider[];
  campfireLight: PointLight;
  ownerTarget: Object3D | null;
}

const HUB_LAYOUT = [
  { key: ISLAND_ASSETS.campfireLit, x: 0, z: -6, scale: 1.35, rotationY: 0, colliderRadius: 1 },
  { key: ISLAND_ASSETS.log, x: -2.5, z: -5.4, scale: 1.1, rotationY: 0.25, colliderRadius: 0.7 },
  { key: ISLAND_ASSETS.log, x: 2.5, z: -5.4, scale: 1.1, rotationY: -0.25, colliderRadius: 0.7 },
  {
    key: ISLAND_ASSETS.log,
    x: 0,
    z: -8.6,
    scale: 1.1,
    rotationY: Math.PI / 2,
    colliderRadius: 0.7,
  },
  { key: ISLAND_ASSETS.flag, x: -4.8, z: -4.4, scale: 1.15, rotationY: 0.35, colliderRadius: 0.4 },
  { key: ISLAND_ASSETS.crate, x: 4.7, z: -4.8, scale: 1.05, rotationY: 0.15, colliderRadius: 0.65 },
  { key: ISLAND_ASSETS.barrel, x: 5.8, z: -5.5, scale: 1, rotationY: -0.25, colliderRadius: 0.6 },
  {
    key: ISLAND_ASSETS.chest,
    x: 4.6,
    z: -6.4,
    scale: 1.05,
    rotationY: -0.55,
    colliderRadius: 0.65,
  },
  { key: ISLAND_ASSETS.rock, x: -5.6, z: -8.4, scale: 1.2, rotationY: 0.4, colliderRadius: 0.75 },
  { key: ISLAND_ASSETS.rock, x: 5.7, z: -8.5, scale: 1, rotationY: -0.65, colliderRadius: 0.65 },
  { key: ISLAND_ASSETS.flowerA, x: -3.7, z: -8.2, scale: 0.8, rotationY: 0.2 },
  { key: ISLAND_ASSETS.flowerB, x: 3.5, z: -8.1, scale: 0.85, rotationY: -0.4 },
  { key: ISLAND_ASSETS.flowerC, x: -3.8, z: -3.6, scale: 0.8, rotationY: 0.7 },
  { key: ISLAND_ASSETS.flowerA, x: 3.6, z: -3.5, scale: 0.75, rotationY: -0.8 },
  { key: ISLAND_ASSETS.mushroom, x: -5.2, z: -6.6, scale: 0.8, rotationY: 0.25 },
  { key: ISLAND_ASSETS.mushroom, x: 6, z: -7.1, scale: 0.75, rotationY: -0.35 },
] as const;

export const computeCentralHubPlacements = (terrain: ITerrainData): ICentralHubPlacement[] =>
  HUB_LAYOUT.map((placement) => ({
    ...placement,
    y: sampleTerrainHeight(terrain, placement.x, placement.z),
  }));

export const createCentralHub = async (
  loader: IAssetLoader,
  terrain: ITerrainData
): Promise<ICentralHubResult> => {
  const group = new Group();
  group.name = "island-central-hub";
  const placements = computeCentralHubPlacements(terrain);
  const assets = await Promise.all(placements.map((placement) => loader.load(placement.key)));
  let ownerTarget: Object3D | null = null;

  placements.forEach((placement, index) => {
    const asset = assets[index];
    if (!asset) return;
    const instance = asset.clone(true);
    instance.name = `central-hub:${placement.key}:${index}`;
    instance.position.set(placement.x, placement.y, placement.z);
    instance.rotation.y = placement.rotationY;
    instance.scale.multiplyScalar(placement.scale);
    if (placement.key === ISLAND_ASSETS.flag) {
      instance.userData.isOwnerProfile = true;
      ownerTarget = instance;
    }
    group.add(instance);
  });

  const campfireLight = new PointLight("#FF9A3D", 8, 10, 1.6);
  campfireLight.name = "central-hub-campfire-light";
  campfireLight.position.set(0, sampleTerrainHeight(terrain, 0, -6) + 1, -6);
  group.add(campfireLight);

  const colliders = placements.flatMap((placement) =>
    placement.colliderRadius
      ? [{ x: placement.x, z: placement.z, radius: placement.colliderRadius }]
      : []
  );
  return { group, colliders, campfireLight, ownerTarget };
};
