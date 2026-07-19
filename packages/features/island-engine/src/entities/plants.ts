/**
 * 打卡植栽與生態氛圍（task 3.7）：
 * 植栽以 InstancedMesh 分種類渲染——數百株植栽 draw call = 種類數（≤4）；
 * 種類幾何取自 Kenney 花/蘑菇 GLB（缺檔退回低面數基本幾何體）；
 * 近 30 天打卡量 → Kenney 動物數量
 */

import {
  type AnimationClip,
  AnimationMixer,
  Color,
  ConeGeometry,
  CylinderGeometry,
  Group,
  IcosahedronGeometry,
  InstancedMesh,
  type Material,
  Matrix4,
  type Mesh,
  MeshStandardMaterial,
  type Object3D,
  Quaternion,
  SphereGeometry,
  Vector3,
} from "three";
import { clone as cloneSkeleton } from "three/addons/utils/SkeletonUtils.js";
import type { IAssetLoader } from "../assets/loader";
import { ISLAND_ASSETS } from "../assets/manifest";
import type { IUpdatable } from "../core/engine";
import { type ITerrainData, sampleTerrainHeight } from "../terrain/generate";
import type { ITerrainTheme } from "../terrain/themes";
import {
  AMBIENT_CRITTER_COUNTS,
  computeEcosystemLevel,
  type IPlantPlacement,
  PLANT_SPECIES_COUNT,
} from "./layout";

const _matrix = new Matrix4();
const _position = new Vector3();
const _quaternion = new Quaternion();
const _scale = new Vector3();
const _axisY = new Vector3(0, 1, 0);

/** 各植栽種類對應的資產 key（index = species） */
export const PLANT_SPECIES_ASSETS: readonly string[] = [
  ISLAND_ASSETS.flowerA,
  ISLAND_ASSETS.flowerB,
  ISLAND_ASSETS.flowerC,
  ISLAND_ASSETS.mushroom,
];

/** 缺檔 fallback：低面數基本幾何體（主題色系） */
const buildFallbackTemplate = (
  species: number,
  theme: ITerrainTheme
): { geometry: InstancedMesh["geometry"]; material: Material; yOffset: number } => {
  const grass = new Color(theme.grass);
  const templates = [
    { geometry: new ConeGeometry(0.28, 0.9, 7), color: grass.clone().multiplyScalar(0.85) },
    { geometry: new SphereGeometry(0.3, 8, 6), color: grass.clone() },
    {
      geometry: new IcosahedronGeometry(0.26, 0),
      color: grass.clone().lerp(new Color(theme.accent), 0.35),
    },
    {
      geometry: new CylinderGeometry(0.06, 0.09, 0.7, 6),
      color: new Color(theme.cliff).lerp(grass, 0.5),
    },
  ];
  const template = templates[species % templates.length] ?? templates[0];
  if (!template) throw new Error("unreachable");
  return {
    geometry: template.geometry,
    material: new MeshStandardMaterial({ color: template.color, roughness: 0.9 }),
    yOffset: 0.3,
  };
};

/** 從 GLB 取第一個 mesh 的 geometry/material（含 manifest scale） */
const extractMeshTemplate = (
  model: Object3D
): {
  geometry: InstancedMesh["geometry"];
  material: Material | Material[];
  meshScale: number;
} | null => {
  let sourceMesh: Mesh | null = null;
  model.traverse((child) => {
    const mesh = child as Mesh;
    if (mesh.isMesh && !sourceMesh) sourceMesh = mesh;
  });
  if (!sourceMesh) return null;
  const source = sourceMesh as Mesh;
  return { geometry: source.geometry, material: source.material, meshScale: model.scale.x };
};

/**
 * 依佈局建立植栽 InstancedMesh（每種類一個，draw call 個位數）。
 * 種類幾何來自花/蘑菇 GLB；載入失敗以基本幾何體替代。
 */
export const createPlantsGroup = async (
  loader: IAssetLoader,
  placements: IPlantPlacement[],
  theme: ITerrainTheme
): Promise<Group> => {
  const group = new Group();
  group.name = "island-plants";

  await Promise.all(
    Array.from({ length: PLANT_SPECIES_COUNT }, (_, species) => species).map(async (species) => {
      const items = placements.filter((placement) => placement.species === species);
      if (items.length === 0) return;

      const assetKey = PLANT_SPECIES_ASSETS[species] ?? ISLAND_ASSETS.flowerA;
      const model = await loader.load(assetKey);

      let geometry: InstancedMesh["geometry"];
      let material: Material | Material[];
      let baseScale = 1;
      let yOffset = 0;
      const extracted = model.userData.isFallback ? null : extractMeshTemplate(model);
      if (extracted) {
        geometry = extracted.geometry;
        material = extracted.material;
        baseScale = extracted.meshScale;
      } else {
        const fallback = buildFallbackTemplate(species, theme);
        geometry = fallback.geometry;
        material = fallback.material;
        yOffset = fallback.yOffset;
      }

      const mesh = new InstancedMesh(geometry, material, items.length);
      mesh.name = `island-plants-species-${species}`;
      items.forEach((placement, index) => {
        const scale = placement.scale * baseScale;
        _position.set(placement.x, placement.y + yOffset * scale, placement.z);
        _quaternion.setFromAxisAngle(_axisY, placement.rotationY);
        _scale.setScalar(scale);
        _matrix.compose(_position, _quaternion, _scale);
        mesh.setMatrixAt(index, _matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
    })
  );

  return group;
};

export interface IAmbientCrittersResult {
  group: Group;
  updatable: IUpdatable;
}

const ANIMAL_ASSET_KEYS = [
  ISLAND_ASSETS.animalBunny,
  ISLAND_ASSETS.animalBee,
  ISLAND_ASSETS.animalChick,
  ISLAND_ASSETS.animalFox,
  ISLAND_ASSETS.animalCrab,
  ISLAND_ASSETS.animalDeer,
  ISLAND_ASSETS.animalFish,
  ISLAND_ASSETS.animalParrot,
  ISLAND_ASSETS.animalFish,
  ISLAND_ASSETS.animalCrab,
  ISLAND_ASSETS.animalFish,
  ISLAND_ASSETS.animalBee,
  ISLAND_ASSETS.animalDeer,
  ISLAND_ASSETS.animalFish,
  ISLAND_ASSETS.animalParrot,
  ISLAND_ASSETS.animalCrab,
  ISLAND_ASSETS.animalFish,
  ISLAND_ASSETS.animalBunny,
] as const;

export interface IAnimalWanderState {
  x: number;
  z: number;
  heading: number;
  phase: number;
  speed: number;
  minRadius: number;
  maxRadius: number;
  turnFrequencyA: number;
  turnFrequencyB: number;
}

export const advanceAnimalWander = (
  state: IAnimalWanderState,
  deltaSeconds: number,
  elapsedSeconds: number
): IAnimalWanderState => {
  let heading =
    state.heading +
    (Math.sin(elapsedSeconds * state.turnFrequencyA + state.phase) * 0.85 +
      Math.sin(elapsedSeconds * state.turnFrequencyB + state.phase * 1.73) * 0.45) *
      deltaSeconds;

  const distance = Math.hypot(state.x, state.z);
  if (distance > state.maxRadius || distance < state.minRadius) {
    const desiredHeading =
      distance > state.maxRadius ? Math.atan2(-state.z, -state.x) : Math.atan2(state.z, state.x);
    const headingDelta = Math.atan2(
      Math.sin(desiredHeading - heading),
      Math.cos(desiredHeading - heading)
    );
    heading += headingDelta * Math.min(1, deltaSeconds * 3.5);
  }

  return {
    ...state,
    x: state.x + Math.cos(heading) * state.speed * deltaSeconds,
    z: state.z + Math.sin(heading) * state.speed * deltaSeconds,
    heading,
  };
};

/** 近 30 天打卡量分級 → 島上實際動物與移動動畫。 */
export const createAmbientCritters = async (
  loader: IAssetLoader,
  recentCheckinCount: number,
  terrain: ITerrainData
): Promise<IAmbientCrittersResult> => {
  const level = computeEcosystemLevel(recentCheckinCount);
  const count = AMBIENT_CRITTER_COUNTS[level];
  const group = new Group();
  group.name = "island-animals";

  const assets = await Promise.all(ANIMAL_ASSET_KEYS.map((key) => loader.load(key)));
  const animals = Array.from({ length: count }, (_, index) => {
    const assetIndex = index % ANIMAL_ASSET_KEYS.length;
    const asset = assets[assetIndex];
    const key = ANIMAL_ASSET_KEYS[assetIndex];
    if (!asset || !key) return null;

    const root = cloneSkeleton(asset);
    root.name = `island-animal:${key}:${index}`;
    const isFlying = key === ISLAND_ASSETS.animalParrot || key === ISLAND_ASSETS.animalBee;
    const isCrab = key === ISLAND_ASSETS.animalCrab;
    const isFish = key === ISLAND_ASSETS.animalFish;
    const radiusRatio = isFish
      ? 0.76 + ((index * 7) % 16) / 100
      : isCrab
        ? 0.72
        : 0.28 + ((index * 17) % 28) / 100;
    const phase = index * 2.399 + (terrain.seed % 97) * 0.031;
    const startRadius = terrain.theme.islandRadius * radiusRatio;
    const wander: IAnimalWanderState = {
      x: Math.cos(phase) * startRadius,
      z: Math.sin(phase) * startRadius,
      heading: phase + (index % 2 === 0 ? Math.PI / 2 : -Math.PI / 2),
      phase,
      speed: (isFlying ? 0.85 : isFish ? 0.7 : isCrab ? 0.38 : 0.58) + ((index * 13) % 5) * 0.06,
      minRadius: terrain.theme.islandRadius * (isFish ? 0.72 : isCrab ? 0.62 : 0.16),
      maxRadius: terrain.theme.islandRadius * (isFish ? 0.98 : isCrab ? 0.82 : 0.62),
      turnFrequencyA: 0.37 + (index % 4) * 0.11,
      turnFrequencyB: 0.83 + (index % 5) * 0.09,
    };
    const mixer = new AnimationMixer(root);
    const clips = asset.userData.animations as AnimationClip[] | undefined;
    const clipName = isFlying ? "idle" : "walk";
    const clip = clips?.find((candidate) => candidate.name === clipName) ?? clips?.[0];
    if (clip) mixer.clipAction(clip).play();

    if (isFish) root.scale.multiplyScalar(1.25);
    root.position.set(wander.x, 0, wander.z);
    group.add(root);
    return { root, mixer, wander, isFlying, isCrab, isFish };
  }).filter((animal): animal is NonNullable<typeof animal> => animal !== null);

  const updatable: IUpdatable = {
    update(deltaSeconds: number, elapsedSeconds: number): void {
      for (const animal of animals) {
        animal.mixer.update(deltaSeconds);
        const next = advanceAnimalWander(animal.wander, deltaSeconds, elapsedSeconds);
        const groundY = sampleTerrainHeight(terrain, next.x, next.z);
        if (!animal.isFlying && !animal.isFish && !animal.isCrab && groundY <= 0.2) {
          next.heading += Math.PI * 0.72;
          next.x = animal.wander.x;
          next.z = animal.wander.z;
        }
        animal.wander = next;
        const y = animal.isFlying
          ? Math.max(groundY, 0) + 3.2 + Math.sin(elapsedSeconds * 1.8 + animal.wander.phase) * 0.35
          : animal.isFish
            ? 0.18 + Math.max(0, Math.sin(elapsedSeconds * 1.2 + animal.wander.phase)) * 0.28
            : animal.isCrab
              ? Math.max(groundY, 0.04)
              : Math.max(groundY, 0.2);
        animal.root.position.set(animal.wander.x, y, animal.wander.z);
        animal.root.rotation.y = Math.PI / 2 - animal.wander.heading;
      }
    },
  };

  return { group, updatable };
};
