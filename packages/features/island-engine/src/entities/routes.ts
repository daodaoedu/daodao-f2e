import {
  CanvasTexture,
  Group,
  type Material,
  type Mesh,
  type Object3D,
  PointLight,
  Sprite,
  SpriteMaterial,
} from "three";
import type { IAssetLoader } from "../assets/loader";
import { ISLAND_ASSETS } from "../assets/manifest";
import { createRandom, hashSeed } from "../core/random";
import { type ITerrainData, sampleTerrainHeight } from "../terrain/generate";
import type { IIslandDestination } from "../types";

export const MAX_ROUTE_BEACONS = 10;
export const ROUTE_INTERACT_RADIUS = 8;
export const ROUTE_BOAT_START_X = 1.65;
export const ROUTE_BOAT_START_Z = 4.3;
export const ROUTE_ARRIVAL_START_Z = 12.5;
/** 主島名義海岸線至鄰島中心的最小距離。 */
export const NEIGHBOR_ISLAND_DISTANCE = 34;
export const ROUTE_DOCKING_RADIUS = 3.2;
export const ROUTE_DESTINATION_MIN_SPACING = 18;
const NEIGHBOR_SHORE_OFFSET = 5.5;
const DESTINATION_DISTANCE_VARIANCE = 28;
const DESTINATION_ANGLE_JITTER_RATIO = 0.18;
const ROUTE_COAST_SEARCH_STEPS = 96;
const ROUTE_SEA_LEVEL = 0;
const ROUTE_WALKABLE_HEIGHT = 0.12;
const ROUTE_INTERACTION_INSET = 3;

export interface IRoutePlacement extends IIslandDestination {
  /** 共用碼頭在目前島嶼上的 world position。 */
  x: number;
  y: number;
  z: number;
  rotationY: number;
  /** 角色可抵達的岸上互動／下船位置。 */
  interactX: number;
  interactZ: number;
  /** 目的島與其靠港點在共用碼頭 local space 的位置。 */
  destinationX: number;
  destinationZ: number;
  destinationRotationY: number;
  dockX: number;
  dockZ: number;
}

interface IDestinationPosition {
  angle: number;
  distance: number;
  x: number;
  z: number;
}

export const createRoutesGroup = (groups: readonly Group[]): Group => {
  const group = new Group();
  group.name = "island-routes";
  if (groups.length > 0) group.add(...groups);
  return group;
};

export const computeRoutePlacements = (
  terrain: ITerrainData,
  destinations: readonly IIslandDestination[]
): IRoutePlacement[] => {
  const visibleDestinations = destinations.slice(0, MAX_ROUTE_BEACONS);
  const harborAngle = -Math.PI / 2;
  const harbor = settleRouteOnCoast(terrain, harborAngle);
  const layoutRandom = createRandom(hashSeed(`${terrain.seed}:route-layout`));
  const layoutRotation = layoutRandom() * Math.PI * 2;

  return visibleDestinations.map((destination, index) => {
    const worldPosition = findScatteredDestinationPosition(
      terrain.seed,
      terrain.theme.islandRadius,
      destination.identifier,
      index,
      visibleDestinations.length,
      layoutRotation
    );
    const { angle: destinationAngle, distance } = worldPosition;
    const dockDistance = distance - NEIGHBOR_SHORE_OFFSET;
    const localPosition = worldToHarborLocal(
      worldPosition.x,
      worldPosition.z,
      harbor,
      -harborAngle + Math.PI / 2
    );
    const localDock = worldToHarborLocal(
      Math.sin(destinationAngle) * dockDistance,
      Math.cos(destinationAngle) * dockDistance,
      harbor,
      -harborAngle + Math.PI / 2
    );

    return {
      ...destination,
      ...harbor,
      rotationY: -harborAngle + Math.PI / 2,
      destinationX: localPosition.x,
      destinationZ: localPosition.z,
      destinationRotationY: destinationAngle - (-harborAngle + Math.PI / 2),
      dockX: localDock.x,
      dockZ: localDock.z,
    };
  });
};

const worldToHarborLocal = (
  worldX: number,
  worldZ: number,
  harbor: { x: number; z: number },
  harborRotationY: number
): { x: number; z: number } => {
  const deltaX = worldX - harbor.x;
  const deltaZ = worldZ - harbor.z;
  const cosine = Math.cos(harborRotationY);
  const sine = Math.sin(harborRotationY);
  return {
    x: cosine * deltaX - sine * deltaZ,
    z: sine * deltaX + cosine * deltaZ,
  };
};

const findScatteredDestinationPosition = (
  terrainSeed: number,
  islandRadius: number,
  identifier: string,
  index: number,
  destinationCount: number,
  layoutRotation: number
): IDestinationPosition => {
  const random = createRandom(hashSeed(`${terrainSeed}:route-destination:${identifier}`));
  const sectorSize = (Math.PI * 2) / Math.max(destinationCount, 1);
  const angleJitter = (random() * 2 - 1) * sectorSize * DESTINATION_ANGLE_JITTER_RATIO;
  const angle = layoutRotation + index * sectorSize + angleJitter;
  const distance =
    islandRadius + NEIGHBOR_ISLAND_DISTANCE + random() * DESTINATION_DISTANCE_VARIANCE;

  return {
    angle,
    distance,
    x: Math.sin(angle) * distance,
    z: Math.cos(angle) * distance,
  };
};

const settleRouteOnCoast = (
  terrain: ITerrainData,
  angle: number
): { x: number; y: number; z: number; interactX: number; interactZ: number } => {
  const innerRadius = terrain.theme.islandRadius * 0.45;
  const outerRadius = terrain.theme.islandRadius * 1.08;
  let coastRadius = innerRadius;
  let interactRadius = innerRadius;
  let coastHeight = sampleTerrainHeight(
    terrain,
    Math.cos(angle) * innerRadius,
    Math.sin(angle) * innerRadius
  );

  for (let step = 1; step <= ROUTE_COAST_SEARCH_STEPS; step++) {
    const radius = innerRadius + ((outerRadius - innerRadius) * step) / ROUTE_COAST_SEARCH_STEPS;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = sampleTerrainHeight(terrain, x, z);
    if (y <= ROUTE_SEA_LEVEL) break;
    if (y > ROUTE_WALKABLE_HEIGHT) interactRadius = radius;
    coastRadius = radius;
    coastHeight = y;
  }

  interactRadius = Math.max(innerRadius, interactRadius - ROUTE_INTERACTION_INSET);
  return {
    x: Math.cos(angle) * coastRadius,
    y: coastHeight,
    z: Math.sin(angle) * coastRadius,
    interactX: Math.cos(angle) * interactRadius,
    interactZ: Math.sin(angle) * interactRadius,
  };
};

const cloneMaterial = (material: Material): Material => {
  const cloned = material.clone();
  const textured = cloned as Material & { map?: import("three").Texture | null };
  if (textured.map) textured.map = textured.map.clone();
  return cloned;
};

const cloneAssetInstance = (asset: Object3D): Object3D => {
  const instance = asset.clone(true);
  instance.traverse((child) => {
    const mesh = child as Mesh;
    if (!mesh.isMesh) return;
    mesh.geometry = mesh.geometry.clone();
    mesh.material = Array.isArray(mesh.material)
      ? mesh.material.map(cloneMaterial)
      : cloneMaterial(mesh.material);
  });
  return instance;
};

/** 每座主島只建立一個共用碼頭、一面航線旗與一艘船。 */
export const createRouteHarbor = async (
  loader: IAssetLoader,
  placement: IRoutePlacement
): Promise<Group> => {
  const harbor = new Group();
  harbor.name = "route-harbor";
  harbor.position.set(placement.x, placement.y, placement.z);
  harbor.rotation.y = placement.rotationY;
  harbor.userData.isRouteHarbor = true;

  const [dockAsset, boatAsset, flagAsset, barrelAsset] = await Promise.all([
    loader.load(ISLAND_ASSETS.dock),
    loader.load(ISLAND_ASSETS.boat),
    loader.load(ISLAND_ASSETS.flag),
    loader.load(ISLAND_ASSETS.barrel),
  ]);

  const dock = cloneAssetInstance(dockAsset);
  dock.name = "route-dock";
  dock.position.set(0, 0, 1.65);
  harbor.add(dock);

  const routeFlag = cloneAssetInstance(flagAsset);
  routeFlag.name = "route-flag";
  routeFlag.position.set(-1.15, 0, 3.2);
  routeFlag.scale.multiplyScalar(0.8);
  harbor.add(routeFlag);

  const light = new PointLight("#70D6D0", 2.5, 5, 1.8);
  light.position.set(-1.15, 1.65, 3.2);
  harbor.add(light);

  const boat = new Group();
  boat.name = "route-boat";
  boat.position.set(ROUTE_BOAT_START_X, 0.32 - placement.y, ROUTE_BOAT_START_Z);
  boat.add(cloneAssetInstance(boatAsset));
  harbor.add(boat);

  // 共用航道以浮標引導離港；出海後玩家可自由轉向任一目的島。
  for (let index = 0; index < 6; index++) {
    const buoy = cloneAssetInstance(barrelAsset);
    buoy.name = `route-buoy:${index}`;
    buoy.position.set(index % 2 === 0 ? -0.72 : 0.72, 0.04 - placement.y, 6 + index * 2.2);
    buoy.scale.multiplyScalar(0.55);
    harbor.add(buoy);
  }

  return harbor;
};

/** 建立遠方目的島；每座目的島各自只有一個供靠港辨識的小碼頭。 */
export const createDestinationIsland = async (
  loader: IAssetLoader,
  placement: IRoutePlacement
): Promise<Group> => {
  const destination = new Group();
  destination.name = `route-destination:${placement.identifier}`;
  destination.position.set(placement.destinationX, 0.25 - placement.y, placement.destinationZ);
  destination.rotation.y = placement.destinationRotationY;
  destination.userData.destinationIdentifier = placement.identifier;

  const [
    dockAsset,
    rockAsset,
    grassAsset,
    cabinAsset,
    palmAsset,
    treeAsset,
    bushAsset,
    campfireAsset,
    crateAsset,
    chestAsset,
    flowerAAsset,
    flowerBAsset,
    flowerCAsset,
  ] = await Promise.all([
    loader.load(ISLAND_ASSETS.dock),
    loader.load(ISLAND_ASSETS.rock),
    loader.load(ISLAND_ASSETS.grassPatch),
    loader.load(ISLAND_ASSETS.cabin),
    loader.load(ISLAND_ASSETS.palmTree),
    loader.load(ISLAND_ASSETS.tree),
    loader.load(ISLAND_ASSETS.bush),
    loader.load(ISLAND_ASSETS.campfireLit),
    loader.load(ISLAND_ASSETS.crate),
    loader.load(ISLAND_ASSETS.chest),
    loader.load(ISLAND_ASSETS.flowerA),
    loader.load(ISLAND_ASSETS.flowerB),
    loader.load(ISLAND_ASSETS.flowerC),
  ]);

  const destinationDock = cloneAssetInstance(dockAsset);
  destinationDock.name = `destination-dock:${placement.identifier}`;
  destinationDock.position.set(0, -0.17, -4.7);
  destinationDock.rotation.y = Math.PI;
  destination.add(destinationDock);

  const islandBase = cloneAssetInstance(rockAsset);
  islandBase.name = `neighbor-island-rock:${placement.identifier}`;
  islandBase.position.y = -2.35;
  islandBase.scale.multiplyScalar(2.8);
  destination.add(islandBase);

  const islandTop = cloneAssetInstance(grassAsset);
  islandTop.name = `neighbor-island-grass:${placement.identifier}`;
  islandTop.position.y = 1.05;
  islandTop.scale.multiplyScalar(5.8);
  destination.add(islandTop);

  const cabin = cloneAssetInstance(cabinAsset);
  cabin.name = `neighbor-island-cabin:${placement.identifier}`;
  cabin.position.set(0.25, 1.05, 0.15);
  cabin.scale.multiplyScalar(0.58);
  destination.add(cabin);

  const palm = cloneAssetInstance(palmAsset);
  palm.name = `neighbor-island-palm:${placement.identifier}`;
  palm.position.set(1.75, 1.05, 1.35);
  palm.scale.multiplyScalar(0.52);
  palm.rotation.y = 0.8;
  destination.add(palm);

  const tree = cloneAssetInstance(treeAsset);
  tree.name = `neighbor-island-tree:${placement.identifier}`;
  tree.position.set(-1.75, 1.05, 0.9);
  tree.scale.multiplyScalar(0.48);
  tree.rotation.y = -0.55;
  destination.add(tree);

  for (const [index, position] of [
    [-1.7, 1.05, -0.85],
    [1.8, 1.05, -0.35],
    [-0.9, 1.05, 1.75],
  ].entries()) {
    const bush = cloneAssetInstance(bushAsset);
    bush.name = `neighbor-island-bush:${placement.identifier}:${index}`;
    bush.position.set(position[0] ?? 0, position[1] ?? 1.05, position[2] ?? 0);
    bush.scale.multiplyScalar(0.58 + index * 0.08);
    destination.add(bush);
  }

  const campfire = cloneAssetInstance(campfireAsset);
  campfire.name = `neighbor-island-campfire:${placement.identifier}`;
  campfire.position.set(1.1, 1.05, -1.35);
  campfire.scale.multiplyScalar(0.42);
  destination.add(campfire);

  const crate = cloneAssetInstance(crateAsset);
  crate.name = `neighbor-island-crate:${placement.identifier}`;
  crate.position.set(-0.8, 0, -4.35);
  crate.scale.multiplyScalar(0.7);
  destination.add(crate);

  const chest = cloneAssetInstance(chestAsset);
  chest.name = `neighbor-island-chest:${placement.identifier}`;
  chest.position.set(-1.2, 1.05, -1.15);
  chest.scale.multiplyScalar(0.72);
  chest.rotation.y = 0.45;
  destination.add(chest);

  const flowerAssets = [flowerAAsset, flowerBAsset, flowerCAsset];
  const flowerPositions = [
    [-0.8, 1.05, 1.35],
    [0.75, 1.05, 1.6],
    [1.65, 1.05, 0.25],
    [-1.55, 1.05, 0.15],
    [0.3, 1.05, -1.7],
  ] as const;
  flowerPositions.forEach((position, index) => {
    const flowerAsset = flowerAssets[index % flowerAssets.length];
    if (!flowerAsset) return;
    const flower = cloneAssetInstance(flowerAsset);
    flower.name = `neighbor-island-flower:${placement.identifier}:${index}`;
    flower.position.set(position[0], position[1], position[2]);
    flower.scale.multiplyScalar(0.48 + (index % 2) * 0.12);
    destination.add(flower);
  });

  const routeLight = new PointLight("#70D6D0", 3, 8, 1.5);
  routeLight.position.set(-1.8, 1.4, -0.5);
  destination.add(routeLight);

  const label = createDestinationLabel(placement.name);
  label.position.set(0, 4.5, 0);
  destination.add(label);
  return destination;
};

const createDestinationLabel = (name: string): Sprite => {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  if (context) {
    context.fillStyle = "rgba(255, 255, 255, 0.92)";
    context.beginPath();
    context.roundRect(8, 8, 496, 112, 28);
    context.fill();
    context.fillStyle = "#176F70";
    context.font = "600 42px sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    const visibleName = name.length > 14 ? `${name.slice(0, 13)}…` : name;
    context.fillText(visibleName, 256, 64, 450);
  }
  const texture = new CanvasTexture(canvas);
  const sprite = new Sprite(new SpriteMaterial({ map: texture, transparent: true }));
  sprite.scale.set(5.2, 1.3, 1);
  return sprite;
};

export const findNearestDestination = (
  placements: readonly IRoutePlacement[],
  x: number,
  z: number,
  radius = ROUTE_INTERACT_RADIUS
): string | null => {
  const harbor = placements[0];
  if (!harbor) return null;
  const distanceSquared = (harbor.interactX - x) ** 2 + (harbor.interactZ - z) ** 2;
  return distanceSquared < radius * radius ? harbor.identifier : null;
};
