/**
 * 地形 three.js 建構層：把純資料（ITerrainData）轉成可渲染的 Mesh
 */

import {
  BufferAttribute,
  CircleGeometry,
  Color,
  Group,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
} from "three";
import type { ITerrainData } from "./generate";

export interface ITerrainMeshes {
  group: Group;
  /** 地形本體（後續 three-mesh-bvh 碰撞、raycast 點擊移動都以此為目標） */
  terrain: Mesh;
  water: Mesh;
}

/**
 * 依高度上色：沙灘 → 草地 → 岩壁（頂點色，無貼圖——風格護欄）
 */
const colorizeVertices = (geometry: PlaneGeometry, data: ITerrainData): void => {
  const { theme } = data;
  const sand = new Color(theme.sand);
  const grass = new Color(theme.grass);
  const cliff = new Color(theme.cliff);
  const position = geometry.getAttribute("position");
  const colors = new Float32Array(position.count * 3);
  const scratch = new Color();
  const sandTop = 0.35;
  const grassTop = theme.hillAmplitude * 0.72;
  for (let i = 0; i < position.count; i++) {
    // geometry 已 rotateX(-90°)，高度在 y
    const height = position.getY(i);
    if (height <= sandTop) {
      scratch.copy(sand);
    } else if (height <= grassTop) {
      const t = (height - sandTop) / (grassTop - sandTop);
      scratch.copy(sand).lerp(grass, Math.min(1, t * 2.2));
    } else {
      const t = Math.min(1, (height - grassTop) / (theme.hillAmplitude * 0.5));
      scratch.copy(grass).lerp(cliff, t);
    }
    colors[i * 3] = scratch.r;
    colors[i * 3 + 1] = scratch.g;
    colors[i * 3 + 2] = scratch.b;
  }
  geometry.setAttribute("color", new BufferAttribute(colors, 3));
};

/**
 * 從 ITerrainData 建構地形與海面 Mesh
 */
export const buildTerrainMeshes = (data: ITerrainData): ITerrainMeshes => {
  const { resolution, size, heights, theme } = data;

  const geometry = new PlaneGeometry(size, size, resolution - 1, resolution - 1);
  geometry.rotateX(-Math.PI / 2);
  const position = geometry.getAttribute("position");
  for (let i = 0; i < position.count; i++) {
    position.setY(i, heights[i] ?? 0);
  }
  position.needsUpdate = true;
  geometry.computeVertexNormals();
  colorizeVertices(geometry, data);

  const terrain = new Mesh(
    geometry,
    new MeshStandardMaterial({ vertexColors: true, flatShading: false, roughness: 0.95 })
  );
  terrain.name = "island-terrain";
  terrain.receiveShadow = true;

  const water = new Mesh(
    new CircleGeometry(size * 1.4, 48),
    new MeshStandardMaterial({
      color: new Color(theme.water),
      transparent: true,
      opacity: 0.82,
      roughness: 0.35,
    })
  );
  water.rotation.x = -Math.PI / 2;
  water.position.y = 0;
  water.name = "island-water";

  const group = new Group();
  group.name = "island-terrain-group";
  group.add(terrain, water);

  return { group, terrain, water };
};
