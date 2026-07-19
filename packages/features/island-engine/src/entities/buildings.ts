/**
 * 實踐建築三維建構層（task 3.6）：
 * active → 帳篷＋燃燒營火（點光源閃爍）、completed → 小木屋；theme_color 染色
 */

import { Color, Group, type Mesh, MeshStandardMaterial, type Object3D, PointLight } from "three";
import type { IAssetLoader } from "../assets/loader";
import { ISLAND_ASSETS } from "../assets/manifest";
import type { IUpdatable } from "../core/engine";
import type { IRadialCollider } from "../physics/ground";
import { BuildingKind } from "./index";
import type { IBuildingPlacement } from "./layout";

/** 建築物碰撞半徑（角色擋牆） */
const BUILDING_COLLIDER_RADIUS = 1.3;
/** 互動鍵的觸發距離 */
export const INTERACT_RADIUS = 2.6;

export interface IBuildingsResult {
  group: Group;
  /** 可點擊物件 → practiceId（raycast 用） */
  clickables: Map<Object3D, string>;
  colliders: IRadialCollider[];
  /** 營火閃爍等動畫 */
  updatable: IUpdatable;
}

/** 把 theme_color 染進模型材質（clone 避免污染共用材質） */
const tintObject = (object: Object3D, themeColor: string | null): void => {
  if (!themeColor) return;
  const tint = new Color(themeColor);
  object.traverse((child) => {
    const mesh = child as Mesh;
    if (!mesh.isMesh) return;
    const material = mesh.material;
    if (Array.isArray(material) || !(material instanceof MeshStandardMaterial)) return;
    const cloned = material.clone();
    cloned.color.lerp(tint, 0.45);
    mesh.material = cloned;
  });
};

/** 單棟建築的建構結果（資產分批 lazy load 用：每棟獨立進場，task 3.8） */
export interface IBuiltBuilding {
  practiceId: string;
  container: Group;
  collider: IRadialCollider;
  /** 燃燒中的營火光源；無營火為 null */
  campfire: PointLight | null;
}

/**
 * 建立單棟實踐建築（active 帳篷＋營火 / completed 小木屋）
 */
export const createBuilding = async (
  loader: IAssetLoader,
  placement: IBuildingPlacement
): Promise<IBuiltBuilding> => {
  const container = new Group();
  container.name = `building:${placement.practiceId}`;
  container.position.set(placement.x, placement.y, placement.z);
  container.rotation.y = placement.rotationY;
  container.userData.practiceId = placement.practiceId;

  let campfireLight: PointLight | null = null;

  if (placement.kind === BuildingKind.cabin) {
    const cabin = await loader.load(ISLAND_ASSETS.cabin);
    const instance = cabin.clone();
    tintObject(instance, placement.themeColor);
    container.add(instance);
  } else {
    const [tent, campfire] = await Promise.all([
      loader.load(ISLAND_ASSETS.tent),
      loader.load(placement.campfireLit ? ISLAND_ASSETS.campfireLit : ISLAND_ASSETS.campfireOut),
    ]);
    const tentInstance = tent.clone();
    tintObject(tentInstance, placement.themeColor);
    container.add(tentInstance);

    const campfireInstance = campfire.clone();
    campfireInstance.position.set(1.2, 0, 0.9);
    container.add(campfireInstance);

    if (placement.campfireLit) {
      campfireLight = new PointLight("#FF9A3D", 6, 7, 1.6);
      campfireLight.position.set(1.2, 0.7, 0.9);
      container.add(campfireLight);
    }
  }

  return {
    practiceId: placement.practiceId,
    container,
    collider: { x: placement.x, z: placement.z, radius: BUILDING_COLLIDER_RADIUS },
    campfire: campfireLight,
  };
};

/** 營火閃爍動畫：讀取外部陣列，建築逐棟進場時往裡 push 即可 */
export const createCampfireFlicker = (campfires: readonly PointLight[]): IUpdatable => ({
  update(_deltaSeconds: number, elapsedSeconds: number): void {
    for (let i = 0; i < campfires.length; i++) {
      const light = campfires[i];
      if (!light) continue;
      light.intensity = 5.4 + Math.sin(elapsedSeconds * 9 + i * 1.7) * 0.9;
    }
  },
});

/**
 * 依佈局建立所有實踐建築；點擊/互動由 engine 的 picking 接手
 */
export const createBuildings = async (
  loader: IAssetLoader,
  placements: IBuildingPlacement[]
): Promise<IBuildingsResult> => {
  const group = new Group();
  group.name = "island-buildings";
  const clickables = new Map<Object3D, string>();
  const colliders: IRadialCollider[] = [];
  const campfires: PointLight[] = [];

  const built = await Promise.all(placements.map((placement) => createBuilding(loader, placement)));
  for (const building of built) {
    clickables.set(building.container, building.practiceId);
    colliders.push(building.collider);
    if (building.campfire) campfires.push(building.campfire);
    group.add(building.container);
  }

  return { group, clickables, colliders, updatable: createCampfireFlicker(campfires) };
};

/**
 * 找出距離 (x, z) 最近且在互動半徑內的建築 practiceId（走近＋互動鍵）
 */
export const findNearestBuilding = (
  placements: readonly IBuildingPlacement[],
  x: number,
  z: number,
  radius = INTERACT_RADIUS
): string | null => {
  let nearest: string | null = null;
  let nearestDistSq = radius * radius;
  for (const placement of placements) {
    const dx = placement.x - x;
    const dz = placement.z - z;
    const distSq = dx * dx + dz * dz;
    if (distSq < nearestDistSq) {
      nearestDistSq = distSq;
      nearest = placement.practiceId;
    }
  }
  return nearest;
};
