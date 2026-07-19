/**
 * three 模組擴充：three-mesh-bvh 安裝在 prototype 上的成員
 * （檔案需為 module context 才能 merge，故有空 import）
 */

import "three";

declare module "three" {
  interface BufferGeometry {
    /** three-mesh-bvh prototype 擴充（installBvh 後可用） */
    computeBoundsTree?(options?: Record<string, unknown>): unknown;
    disposeBoundsTree?(): void;
    boundsTree?: unknown;
  }

  interface Raycaster {
    /** three-mesh-bvh：只取第一個命中，加速 raycast */
    firstHitOnly?: boolean;
  }
}
