/**
 * 操控純函式單元測試（task 3.4）
 */

import { Object3D, PerspectiveCamera } from "three";
import { describe, expect, it } from "vitest";
import { findNearestBuilding } from "../../entities/buildings";
import type { IBuildingPlacement } from "../../entities/layout";
import { resolveRadialCollisions } from "../../physics/ground";
import { CharacterController, computeMoveTowardTarget, computeWorldMove } from "../index";

describe("computeWorldMove（camera-relative 移動）", () => {
  it("無輸入不移動", () => {
    expect(computeWorldMove(0, 0, 1.2, 5, 0.016)).toEqual({ dx: 0, dz: 0 });
  });

  it("yaw=0 時前進（moveZ=-1）朝 -z", () => {
    const { dx, dz } = computeWorldMove(0, -1, 0, 5, 0.1);
    expect(dx).toBeCloseTo(0, 5);
    expect(dz).toBeCloseTo(-0.5, 5);
  });

  it("移動距離不超過 speed × dt（斜向不加速）", () => {
    const { dx, dz } = computeWorldMove(1, -1, 0.7, 5, 0.1);
    expect(Math.hypot(dx, dz)).toBeLessThanOrEqual(0.5 + 1e-9);
  });

  it("視角旋轉半圈後前進方向反轉", () => {
    const forward = computeWorldMove(0, -1, 0, 5, 0.1);
    const backward = computeWorldMove(0, -1, Math.PI, 5, 0.1);
    expect(backward.dx).toBeCloseTo(-forward.dx, 5);
    expect(backward.dz).toBeCloseTo(-forward.dz, 5);
  });
});

describe("computeMoveTowardTarget（點擊地面移動）", () => {
  it("朝世界座標目標移動，不受相機方向影響", () => {
    const result = computeMoveTowardTarget(0, 0, 3, 4, 2, 0.5);
    expect(result.dx).toBeCloseTo(0.6);
    expect(result.dz).toBeCloseTo(0.8);
    expect(result.reached).toBe(false);
  });

  it("接近終點時不會跨過目標", () => {
    expect(computeMoveTowardTarget(0, 0, 0.2, 0, 5.2, 1)).toEqual({
      dx: 0.2,
      dz: 0,
      reached: true,
    });
  });

  it("已在停止距離內時不再移動", () => {
    expect(computeMoveTowardTarget(1, 1, 1.05, 1.05, 5.2, 0.016)).toEqual({
      dx: 0,
      dz: 0,
      reached: true,
    });
  });
});

describe("resolveRadialCollisions（擋牆）", () => {
  const colliders = [{ x: 0, z: 0, radius: 2 }];

  it("圓外不受影響", () => {
    expect(resolveRadialCollisions(5, 5, colliders)).toEqual({ x: 5, z: 5 });
  });

  it("圓內被推到圓周上", () => {
    const { x, z } = resolveRadialCollisions(1, 0, colliders);
    expect(Math.hypot(x, z)).toBeCloseTo(2, 5);
    expect(x).toBeCloseTo(2, 5);
    expect(z).toBeCloseTo(0, 5);
  });

  it("圓心退化情形往 +x 推出", () => {
    const { x, z } = resolveRadialCollisions(0, 0, colliders);
    expect(x).toBeCloseTo(2, 5);
    expect(z).toBeCloseTo(0, 5);
  });
});

describe("findNearestBuilding（走近＋互動鍵）", () => {
  const placement = (practiceId: string, x: number, z: number): IBuildingPlacement => ({
    practiceId,
    kind: "tent",
    themeColor: null,
    campfireLit: true,
    x,
    y: 0,
    z,
    rotationY: 0,
  });
  const placements = [placement("far", 10, 10), placement("near", 1, 1)];

  it("回傳互動半徑內最近的建築", () => {
    expect(findNearestBuilding(placements, 0, 0)).toBe("near");
  });

  it("範圍內沒有建築回傳 null", () => {
    expect(findNearestBuilding(placements, -20, -20)).toBeNull();
  });
});

describe("CharacterController.teleport（下船落點）", () => {
  it("將角色移到碼頭岸邊並同步模型位置", () => {
    const avatar = new Object3D();
    const controller = new CharacterController({
      avatar,
      camera: new PerspectiveCamera(),
      input: {
        consumeFrame: () => ({
          moveX: 0,
          moveZ: 0,
          lookDeltaX: 0,
          lookDeltaY: 0,
          zoomDelta: 0,
          interact: false,
        }),
        dispose: () => undefined,
      },
      ground: { heightAt: () => 1.25 },
    });

    controller.teleport(7, -9);

    expect(controller.getPosition()).toEqual({ x: 7, z: -9 });
    expect(avatar.position.toArray()).toEqual([7, 1.25, -9]);
  });
});

describe("CharacterController 點擊移動", () => {
  const idleFrame = {
    moveX: 0,
    moveZ: 0,
    lookDeltaX: 0,
    lookDeltaY: 0,
    zoomDelta: 0,
    interact: false,
  };

  it("接受陸地目標、移動角色並回報目標效果", () => {
    const avatar = new Object3D();
    const targetChanges: Array<{ x: number; z: number } | null> = [];
    const controller = new CharacterController({
      avatar,
      camera: new PerspectiveCamera(),
      input: {
        consumeFrame: () => idleFrame,
        dispose: () => undefined,
      },
      ground: { heightAt: () => 1 },
      onMoveTargetChange: (target) => targetChanges.push(target),
    });

    expect(controller.moveTo(3, 4)).toBe(true);
    controller.update(0.1);

    expect(targetChanges).toEqual([{ x: 3, z: 4 }]);
    expect(Math.hypot(avatar.position.x, avatar.position.z)).toBeCloseTo(0.52);
  });

  it("鍵盤移動會取消點擊目標與效果", () => {
    const targetChanges: Array<{ x: number; z: number } | null> = [];
    const controller = new CharacterController({
      avatar: new Object3D(),
      camera: new PerspectiveCamera(),
      input: {
        consumeFrame: () => ({ ...idleFrame, moveX: 1 }),
        dispose: () => undefined,
      },
      ground: { heightAt: () => 1 },
      onMoveTargetChange: (target) => targetChanges.push(target),
    });

    controller.moveTo(3, 4);
    controller.update(0.1);

    expect(targetChanges).toEqual([{ x: 3, z: 4 }, null]);
  });

  it("拒絕水面與障礙物內的目標", () => {
    const waterController = new CharacterController({
      avatar: new Object3D(),
      camera: new PerspectiveCamera(),
      input: { consumeFrame: () => idleFrame, dispose: () => undefined },
      ground: { heightAt: () => 0 },
    });
    const blockedController = new CharacterController({
      avatar: new Object3D(),
      camera: new PerspectiveCamera(),
      input: { consumeFrame: () => idleFrame, dispose: () => undefined },
      ground: { heightAt: () => 1 },
      colliders: [{ x: 2, z: 2, radius: 1 }],
    });

    expect(waterController.moveTo(2, 2)).toBe(false);
    expect(blockedController.moveTo(2, 2)).toBe(false);
  });
});
