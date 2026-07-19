/**
 * three-mesh-bvh 貼地取樣與簡單碰撞（design D2：不上物理引擎）
 */

import { BufferGeometry, Mesh, Raycaster, Vector3 } from "three";
import { acceleratedRaycast, computeBoundsTree, disposeBoundsTree } from "three-mesh-bvh";
import type { IGroundSampler } from "./index";

let bvhInstalled = false;

/** 安裝 three-mesh-bvh 的 prototype 擴充（idempotent） */
export const installBvh = (): void => {
  if (bvhInstalled) return;
  bvhInstalled = true;
  BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
  BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
  Mesh.prototype.raycast = acceleratedRaycast;
};

export interface IBvhGroundSampler extends IGroundSampler {
  dispose(): void;
}

/**
 * 以地形 mesh 建 BVH，向下 raycast 取地面高度。
 * 取不到（射線落在地形外）回傳 fallback 高度。
 */
export const createBvhGroundSampler = (
  terrainMesh: Mesh,
  fallbackHeight = -2
): IBvhGroundSampler => {
  installBvh();
  const geometry = terrainMesh.geometry as BufferGeometry;
  geometry.computeBoundsTree?.();

  const raycaster = new Raycaster();
  raycaster.firstHitOnly = true;
  const origin = new Vector3();
  const down = new Vector3(0, -1, 0);

  return {
    heightAt(x: number, z: number): number {
      origin.set(x, 50, z);
      raycaster.set(origin, down);
      const hit = raycaster.intersectObject(terrainMesh, false)[0];
      return hit ? hit.point.y : fallbackHeight;
    },
    dispose(): void {
      geometry.disposeBoundsTree?.();
    },
  };
};

/** 圓柱型障礙物（建築、岩石）：角色以半徑推擠方式擋牆 */
export interface IRadialCollider {
  x: number;
  z: number;
  radius: number;
}

/**
 * 把 (x, z) 推出所有圓形障礙物（純函式，可單元測試）
 */
export const resolveRadialCollisions = (
  x: number,
  z: number,
  colliders: readonly IRadialCollider[]
): { x: number; z: number } => {
  let outX = x;
  let outZ = z;
  for (const collider of colliders) {
    const dx = outX - collider.x;
    const dz = outZ - collider.z;
    const distSq = dx * dx + dz * dz;
    if (distSq >= collider.radius * collider.radius) continue;
    const dist = Math.sqrt(distSq);
    if (dist < 1e-6) {
      // 正好在圓心：往 +x 推出
      outX = collider.x + collider.radius;
      continue;
    }
    const scale = collider.radius / dist;
    outX = collider.x + dx * scale;
    outZ = collider.z + dz * scale;
  }
  return { x: outX, z: outZ };
};
