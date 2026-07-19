/**
 * 操控純函式單元測試（task 3.4）
 */

import { describe, expect, it } from "vitest";
import { findNearestBuilding } from "../../entities/buildings";
import type { IBuildingPlacement } from "../../entities/layout";
import { resolveRadialCollisions } from "../../physics/ground";
import { computeWorldMove } from "../index";

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
