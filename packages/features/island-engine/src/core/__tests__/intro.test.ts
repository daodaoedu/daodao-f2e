/**
 * 環島空拍 intro 單元測試（task 3.8）
 */

import { PerspectiveCamera } from "three";
import { describe, expect, it, vi } from "vitest";
import { computeThirdPersonCameraPose } from "../../controls/character-controller";
import { AerialIntro } from "../intro";

const buildIntro = (onComplete?: () => void) => {
  const camera = new PerspectiveCamera(55, 1, 0.1, 200);
  const endPose = computeThirdPersonCameraPose(0, 0, 1.2);
  const intro = new AerialIntro({ camera, islandRadius: 15, endPose, duration: 6, onComplete });
  return { camera, endPose, intro };
};

describe("AerialIntro", () => {
  it("播完後相機收斂到第三人稱結束姿態且觸發 onComplete 一次", () => {
    const onComplete = vi.fn();
    const { camera, endPose, intro } = buildIntro(onComplete);

    for (let i = 0; i < 65; i++) intro.update(0.1, i * 0.1);

    expect(intro.isDone()).toBe(true);
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(camera.position.x).toBeCloseTo(endPose.position[0], 3);
    expect(camera.position.y).toBeCloseTo(endPose.position[1], 3);
    expect(camera.position.z).toBeCloseTo(endPose.position[2], 3);

    // 完成後再 update 不再變動、不重複觸發
    intro.update(1, 10);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("skip 立即跳到結束姿態", () => {
    const onComplete = vi.fn();
    const { camera, endPose, intro } = buildIntro(onComplete);

    intro.update(0.1, 0.1);
    intro.skip();

    expect(intro.isDone()).toBe(true);
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(camera.position.y).toBeCloseTo(endPose.position[1], 3);
  });

  it("起始為高空遠景（高於結束姿態）", () => {
    const { camera, endPose } = buildIntro();
    expect(camera.position.y).toBeGreaterThan(endPose.position[1]);
  });

  it("computeThirdPersonCameraPose 為純函式且注視角色頭部", () => {
    const a = computeThirdPersonCameraPose(3, -2, 0.8);
    const b = computeThirdPersonCameraPose(3, -2, 0.8);
    expect(a).toEqual(b);
    expect(a.target).toEqual([3, 0.8 + 1.1, -2]);
  });
});
