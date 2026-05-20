import { describe, expect, it } from "vitest";
import { computeBodyDisplayLeft } from "../check-in-stack-utils";

const CONTAINER_WIDTH = 448;

describe("computeBodyDisplayLeft", () => {
  it("keeps a body inside the container centered on its physics position", () => {
    // 200 居中、無旋轉：left = 200 - 80/2 = 160
    expect(computeBodyDisplayLeft(200, 80, 80, 0, CONTAINER_WIDTH)).toBe(160);
  });

  it("clamps a body that physics pushed past the left edge so left >= 0", () => {
    const left = computeBodyDisplayLeft(0, 80, 80, 0, CONTAINER_WIDTH);
    expect(left).toBe(0);
    expect(left).toBeGreaterThanOrEqual(0);
  });

  it("clamps a body that physics pushed past the right edge so right <= container", () => {
    const width = 80;
    const left = computeBodyDisplayLeft(CONTAINER_WIDTH, width, 80, 0, CONTAINER_WIDTH);
    expect(left + width).toBeLessThanOrEqual(CONTAINER_WIDTH);
    expect(left + width).toBe(CONTAINER_WIDTH);
  });

  it("accounts for rotation so a tilted wide shape is not cut off", () => {
    // 268x138 半圓傾斜 20 度（容器最寬的形狀，最容易被切）
    const width = 268;
    const angle = (20 * Math.PI) / 180;
    const leftPushed = computeBodyDisplayLeft(0, width, 138, angle, CONTAINER_WIDTH);
    const rightPushed = computeBodyDisplayLeft(CONTAINER_WIDTH, width, 138, angle, CONTAINER_WIDTH);
    const rotatedHalfWidth =
      (Math.abs(Math.cos(angle)) * width + Math.abs(Math.sin(angle)) * 138) / 2;
    const overhang = rotatedHalfWidth - width / 2;
    // 旋轉後的外緣不超出容器：左側 >= 0、右側 <= 容器寬
    expect(leftPushed).toBeCloseTo(overhang, 5);
    expect(rightPushed + width).toBeCloseTo(CONTAINER_WIDTH - overhang, 5);
  });

  it("centers a shape wider than the container instead of biasing one side", () => {
    const width = 500;
    const left = computeBodyDisplayLeft(0, width, 100, 0, CONTAINER_WIDTH);
    // 兩側切量相等
    expect(left).toBe(CONTAINER_WIDTH / 2 - width / 2);
  });
});
