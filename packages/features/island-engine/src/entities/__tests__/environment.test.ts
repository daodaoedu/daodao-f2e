import { BoxGeometry, Group, Matrix4, Mesh, MeshStandardMaterial, Vector3 } from "three";
import { describe, expect, it } from "vitest";
import { createEnvironmentInstances } from "../environment";
import { EnvironmentKind, type IEnvironmentPlacement } from "../layout";

const placements: IEnvironmentPlacement[] = [
  {
    kind: EnvironmentKind.rock,
    x: 3,
    y: 1,
    z: -2,
    scale: 1.5,
    rotationY: 0.4,
  },
  {
    kind: EnvironmentKind.rock,
    x: -4,
    y: 0.5,
    z: 6,
    scale: 0.8,
    rotationY: 1.2,
  },
];

describe("environment instances", () => {
  it("packs repeated GLB meshes into one instanced draw call", () => {
    const model = new Group();
    model.scale.setScalar(2);
    model.add(new Mesh(new BoxGeometry(1, 1, 1), new MeshStandardMaterial()));

    const instances = createEnvironmentInstances(model, placements, EnvironmentKind.rock);

    expect(instances).not.toBeNull();
    expect(instances?.count).toBe(placements.length);
    expect(instances?.name).toBe("island-environment:rock");

    const matrix = new Matrix4();
    const position = new Vector3();
    instances?.getMatrixAt(0, matrix);
    position.setFromMatrixPosition(matrix);
    expect(position.toArray()).toEqual([3, 1, -2]);
  });
});
