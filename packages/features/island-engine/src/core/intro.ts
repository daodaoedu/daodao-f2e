/**
 * 進場環島空拍 intro（task 3.8）
 *
 * 高空環島 270° 緩降，結束姿態收斂到第三人稱相機的預設 pose
 * （與 CharacterController 共用 computeThirdPersonCameraPose，無縫接手）。
 * 任何輸入（點擊/按鍵/觸控）可跳過；intro 同時吸收資產 lazy load 的等待。
 */

import type { PerspectiveCamera } from "three";
import type { IUpdatable } from "./engine";

export interface IAerialIntroOptions {
  camera: PerspectiveCamera;
  /** 島半徑（起始軌道半徑基準） */
  islandRadius: number;
  /** 結束姿態（computeThirdPersonCameraPose 的輸出） */
  endPose: { position: [number, number, number]; target: [number, number, number] };
  /** 秒數，預設 6.5 */
  duration?: number;
  onComplete?: () => void;
}

const easeInOutCubic = (t: number): number => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

export class AerialIntro implements IUpdatable {
  private readonly options: IAerialIntroOptions;
  private readonly duration: number;
  private elapsed = 0;
  private done = false;

  constructor(options: IAerialIntroOptions) {
    this.options = options;
    this.duration = options.duration ?? 6.5;
    this.apply(0);
  }

  isDone(): boolean {
    return this.done;
  }

  /** 跳過：直接跳到結束姿態並觸發 onComplete */
  skip(): void {
    if (this.done) return;
    this.apply(1);
    this.finish();
  }

  update(deltaSeconds: number, _elapsedSeconds?: number): void {
    if (this.done) return;
    this.elapsed += deltaSeconds;
    const progress = Math.min(1, this.elapsed / this.duration);
    this.apply(easeInOutCubic(progress));
    if (progress >= 1) this.finish();
  }

  private finish(): void {
    if (this.done) return;
    this.done = true;
    this.options.onComplete?.();
  }

  /** t=0 高空遠景 → t=1 第三人稱結束姿態 */
  private apply(t: number): void {
    const { camera, islandRadius, endPose } = this.options;
    const [endX, endY, endZ] = endPose.position;
    const [targetX, targetY, targetZ] = endPose.target;

    // 結束點的方位角；環島從它的對側開始繞 270°
    const endAngle = Math.atan2(endZ - targetZ, endX - targetX);
    const angle = endAngle + (1 - t) * Math.PI * 1.5;

    const startRadius = islandRadius * 2.2;
    const endRadius = Math.hypot(endX - targetX, endZ - targetZ);
    const radius = startRadius + (endRadius - startRadius) * t;

    const startHeight = islandRadius * 1.8;
    const height = startHeight + (endY - startHeight) * t;

    camera.position.set(
      targetX + Math.cos(angle) * radius,
      height,
      targetZ + Math.sin(angle) * radius
    );
    // 注視點從島心緩移到角色頭部
    camera.lookAt(targetX * t, targetY * t, targetZ * t);
  }
}
