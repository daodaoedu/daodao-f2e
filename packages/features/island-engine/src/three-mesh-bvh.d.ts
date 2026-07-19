/**
 * three-mesh-bvh 型別補充
 *
 * 該套件的 exports map 沒有 "types" 條件、且型別只隨 ESM 入口發佈，
 * 在 NodeNext（CJS）解析下拿不到官方 d.ts——此處宣告本專案用到的最小介面，
 * 並補上其對 three 的 prototype 擴充（computeBoundsTree / firstHitOnly）。
 */

declare module "three-mesh-bvh" {
  import type { BufferGeometry, Intersection, Raycaster } from "three";

  export class MeshBVH {
    constructor(geometry: BufferGeometry, options?: Record<string, unknown>);
  }

  export function computeBoundsTree(
    this: BufferGeometry,
    options?: Record<string, unknown>
  ): MeshBVH;

  export function disposeBoundsTree(this: BufferGeometry): void;

  export function acceleratedRaycast(
    this: unknown,
    raycaster: Raycaster,
    intersects: Intersection[]
  ): void;
}
