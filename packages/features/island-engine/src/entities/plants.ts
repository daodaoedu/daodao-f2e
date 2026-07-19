/**
 * 打卡植栽與生態氛圍（task 3.7）：
 * 植栽以 InstancedMesh 分種類渲染——數百株植栽 draw call = 種類數（≤4）；
 * 近 30 天打卡量 → 氛圍粒子（螢火/蝴蝶感的漂浮光點）數量
 */

import {
  Color,
  ConeGeometry,
  CylinderGeometry,
  Group,
  IcosahedronGeometry,
  InstancedMesh,
  Matrix4,
  MeshStandardMaterial,
  Quaternion,
  SphereGeometry,
  Vector3,
} from "three";
import type { IUpdatable } from "../core/engine";
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

/** 各種類的幾何與配色（主題色系：草綠/強調色的低面數形狀） */
const buildSpeciesTemplates = (
  theme: ITerrainTheme
): {
  geometry: ConeGeometry | SphereGeometry | CylinderGeometry | IcosahedronGeometry;
  color: Color;
  baseScale: number;
}[] => [
  {
    geometry: new ConeGeometry(0.28, 0.9, 7),
    color: new Color(theme.grass).multiplyScalar(0.85),
    baseScale: 1,
  },
  { geometry: new SphereGeometry(0.3, 8, 6), color: new Color(theme.grass), baseScale: 0.9 },
  {
    geometry: new IcosahedronGeometry(0.26, 0),
    color: new Color(theme.grass).lerp(new Color(theme.accent), 0.35),
    baseScale: 0.85,
  },
  {
    geometry: new CylinderGeometry(0.06, 0.09, 0.7, 6),
    color: new Color(theme.cliff).lerp(new Color(theme.grass), 0.5),
    baseScale: 1.05,
  },
];

/**
 * 依佈局建立植栽 InstancedMesh（每種類一個，draw call 個位數）
 */
export const createPlantsGroup = (placements: IPlantPlacement[], theme: ITerrainTheme): Group => {
  const group = new Group();
  group.name = "island-plants";
  const templates = buildSpeciesTemplates(theme);

  for (let species = 0; species < PLANT_SPECIES_COUNT; species++) {
    const template = templates[species];
    if (!template) continue;
    const items = placements.filter((placement) => placement.species === species);
    if (items.length === 0) continue;

    const mesh = new InstancedMesh(
      template.geometry,
      new MeshStandardMaterial({ color: template.color, roughness: 0.9 }),
      items.length
    );
    mesh.name = `island-plants-species-${species}`;
    items.forEach((placement, index) => {
      const scale = placement.scale * template.baseScale;
      _position.set(placement.x, placement.y + 0.3 * scale, placement.z);
      _quaternion.setFromAxisAngle(_axisY, placement.rotationY);
      _scale.setScalar(scale);
      _matrix.compose(_position, _quaternion, _scale);
      mesh.setMatrixAt(index, _matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    group.add(mesh);
  }

  return group;
};

export interface IAmbientCrittersResult {
  group: Group;
  updatable: IUpdatable;
}

/**
 * 生態氛圍：近 30 天打卡量分級 → 漂浮光點數量與漂浮動畫。
 * 只加不減——低活躍只是安靜，不出現枯萎/警示視覺（spec「無壓力型視覺」）。
 */
export const createAmbientCritters = (
  recentCheckinCount: number,
  islandRadius: number,
  theme: ITerrainTheme
): IAmbientCrittersResult => {
  const level = computeEcosystemLevel(recentCheckinCount);
  const count = AMBIENT_CRITTER_COUNTS[level];
  const group = new Group();
  group.name = "island-critters";

  if (count === 0) {
    return { group, updatable: { update: () => undefined } };
  }

  const mesh = new InstancedMesh(
    new SphereGeometry(0.09, 6, 5),
    new MeshStandardMaterial({
      color: new Color(theme.accent),
      emissive: new Color(theme.accent),
      emissiveIntensity: 0.9,
    }),
    count
  );
  mesh.name = "island-critters-points";
  group.add(mesh);

  // 每顆光點的漂浮軌道參數（以 index 派生，deterministic）
  const orbits = Array.from({ length: count }, (_, index) => ({
    radius: islandRadius * (0.25 + ((index * 37) % 50) / 100),
    height: 1.2 + ((index * 53) % 30) / 12,
    speed: 0.15 + ((index * 29) % 20) / 60,
    phase: index * 2.399,
  }));

  const updatable: IUpdatable = {
    update(_deltaSeconds: number, elapsedSeconds: number): void {
      orbits.forEach((orbit, index) => {
        const angle = orbit.phase + elapsedSeconds * orbit.speed;
        _position.set(
          Math.cos(angle) * orbit.radius,
          orbit.height + Math.sin(elapsedSeconds * 1.7 + orbit.phase) * 0.35,
          Math.sin(angle) * orbit.radius
        );
        _quaternion.identity();
        _scale.setScalar(1);
        _matrix.compose(_position, _quaternion, _scale);
        mesh.setMatrixAt(index, _matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    },
  };

  return { group, updatable };
};
