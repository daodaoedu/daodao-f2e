import { InstancedMesh, Matrix4, type Mesh, type Object3D, Quaternion, Vector3 } from "three";
import type { IEnvironmentPlacement } from "./layout";

const position = new Vector3();
const quaternion = new Quaternion();
const scale = new Vector3();
const axisY = new Vector3(0, 1, 0);
const placementMatrix = new Matrix4();
const instanceMatrix = new Matrix4();

export const createEnvironmentInstances = (
  model: Object3D,
  placements: readonly IEnvironmentPlacement[],
  kind: string
): InstancedMesh | null => {
  if (placements.length === 0) return null;

  model.updateMatrixWorld(true);
  let source: Mesh | null = null;
  model.traverse((child) => {
    const mesh = child as Mesh;
    if (!source && mesh.isMesh) source = mesh;
  });
  if (!source) return null;

  const sourceMesh = source as Mesh;
  const instances = new InstancedMesh(sourceMesh.geometry, sourceMesh.material, placements.length);
  instances.name = `island-environment:${kind}`;

  placements.forEach((placement, index) => {
    position.set(placement.x, placement.y, placement.z);
    quaternion.setFromAxisAngle(axisY, placement.rotationY);
    scale.setScalar(placement.scale);
    placementMatrix.compose(position, quaternion, scale);
    instanceMatrix.multiplyMatrices(placementMatrix, sourceMesh.matrixWorld);
    instances.setMatrixAt(index, instanceMatrix);
  });

  instances.instanceMatrix.needsUpdate = true;
  instances.castShadow = true;
  instances.receiveShadow = true;
  return instances;
};
