/**
 * 草皮地毯（spike 視覺定案）：
 * 從 patch-grass GLB 取出幾何，以 InstancedMesh 鋪滿島面——
 * 數百株只佔 1 個 draw call；材質朝主題草色微調保留人格差異
 */

import {
  Color,
  InstancedMesh,
  Matrix4,
  type Mesh,
  MeshStandardMaterial,
  type Object3D,
  Quaternion,
  Vector3,
} from "three";
import type { ITerrainTheme } from "../terrain/themes";
import type { IGrassPlacement } from "./layout";

const _matrix = new Matrix4();
const _position = new Vector3();
const _quaternion = new Quaternion();
const _scale = new Vector3();
const _axisY = new Vector3(0, 1, 0);

/**
 * 建立草皮 InstancedMesh；GLB 缺檔（model 為 fallback）時回傳 null，
 * 地形頂點色仍能撐住畫面
 */
export const createGrassCarpet = (
  model: Object3D,
  placements: IGrassPlacement[],
  theme: ITerrainTheme
): InstancedMesh | null => {
  if (placements.length === 0 || model.userData.isFallback) return null;

  let sourceMesh: Mesh | null = null;
  model.traverse((child) => {
    const mesh = child as Mesh;
    if (mesh.isMesh && !sourceMesh) sourceMesh = mesh;
  });
  if (!sourceMesh) return null;
  const source = sourceMesh as Mesh;

  // 草皮用主題草色的純色材質（略深一階製造層次），
  // 不用 Kenney 原貼圖——深綠與粉彩地形對比太高、視覺打架
  const material = new MeshStandardMaterial({
    color: new Color(theme.grass).multiplyScalar(0.85),
    roughness: 0.95,
  });

  const instanced = new InstancedMesh(source.geometry, material, placements.length);
  instanced.name = "island-grass-carpet";
  placements.forEach((placement, index) => {
    _position.set(placement.x, placement.y, placement.z);
    _quaternion.setFromAxisAngle(_axisY, placement.rotationY);
    _scale.setScalar(placement.scale);
    _matrix.compose(_position, _quaternion, _scale);
    instanced.setMatrixAt(index, _matrix);
  });
  instanced.instanceMatrix.needsUpdate = true;
  instanced.castShadow = true;
  instanced.receiveShadow = true;
  return instanced;
};
