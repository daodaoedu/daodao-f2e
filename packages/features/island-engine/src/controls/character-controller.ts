/**
 * 第三人稱角色控制器（task 3.4）：
 * camera-relative 移動、BVH 貼地、水線邊界、圓形障礙擋牆、相機跟隨
 */

import type { Object3D, PerspectiveCamera } from "three";
import type { IUpdatable } from "../core/engine";
import type { IGroundSampler } from "../physics";
import { type IRadialCollider, resolveRadialCollisions } from "../physics/ground";
import { computeWorldMove, type IInputSource } from "./index";

const WALK_SPEED = 5.2;
const MIN_PITCH = 0.12;
const MAX_PITCH = 1.25;
const MIN_DISTANCE = 4;
const MAX_DISTANCE = 18;
/** 地形高度低於此值視為入水，不可走 */
const WATER_LINE = 0.12;

const DEFAULT_YAW = 0;
const DEFAULT_PITCH = 0.55;
const DEFAULT_DISTANCE = 9;
/** 相機注視點高（角色頭部） */
const HEAD_HEIGHT = 1.1;

/**
 * 依預設 yaw/pitch/distance 計算第三人稱相機姿態（純函式）。
 * 空拍 intro 的結束姿態用同一函式，保證 intro → 操控無縫接手。
 */
export const computeThirdPersonCameraPose = (
  x: number,
  z: number,
  groundHeight: number
): { position: [number, number, number]; target: [number, number, number] } => {
  const headY = groundHeight + HEAD_HEIGHT;
  const horizontal = DEFAULT_DISTANCE * Math.cos(DEFAULT_PITCH);
  return {
    position: [
      x + Math.sin(DEFAULT_YAW) * horizontal,
      headY + DEFAULT_DISTANCE * Math.sin(DEFAULT_PITCH),
      z + Math.cos(DEFAULT_YAW) * horizontal,
    ],
    target: [x, headY, z],
  };
};

export interface ICharacterControllerOptions {
  /** 角色根節點（base transform 由控制器管理；動畫疊加在子節點上） */
  avatar: Object3D;
  camera: PerspectiveCamera;
  input: IInputSource;
  ground: IGroundSampler;
  colliders?: readonly IRadialCollider[];
  /** 出生點 */
  spawn?: { x: number; z: number };
  /** 每幀回報目前移動速度（0..1，供走路動畫） */
  onMoveSpeed?: (normalizedSpeed: number) => void;
  /** 互動鍵按下時回報角色位置（engine 據此找最近建築） */
  onInteract?: (x: number, z: number) => void;
  /** 相機閘門：空拍 intro 播放期間回傳 false，intro 擁有相機 */
  cameraEnabled?: () => boolean;
}

export class CharacterController implements IUpdatable {
  private readonly options: ICharacterControllerOptions;
  private x: number;
  private z: number;
  private yaw = DEFAULT_YAW;
  private pitch = DEFAULT_PITCH;
  private distance = DEFAULT_DISTANCE;
  private facing = 0;

  constructor(options: ICharacterControllerOptions) {
    this.options = options;
    this.x = options.spawn?.x ?? 0;
    this.z = options.spawn?.z ?? 0;
    this.syncAvatar(0);
    if (this.options.cameraEnabled?.() !== false) this.syncCamera();
  }

  getPosition(): { x: number; z: number } {
    return { x: this.x, z: this.z };
  }

  update(deltaSeconds: number): void {
    const input = this.options.input.consumeFrame();

    // 視角
    this.yaw -= input.lookDeltaX;
    this.pitch = Math.min(MAX_PITCH, Math.max(MIN_PITCH, this.pitch + input.lookDeltaY));
    this.distance = Math.min(MAX_DISTANCE, Math.max(MIN_DISTANCE, this.distance + input.zoomDelta));

    // 移動（camera-relative）
    const { dx, dz } = computeWorldMove(
      input.moveX,
      input.moveZ,
      this.yaw,
      WALK_SPEED,
      deltaSeconds
    );
    let nextX = this.x + dx;
    let nextZ = this.z + dz;

    // 擋牆：先推出障礙物，再檢查水線
    const resolved = resolveRadialCollisions(nextX, nextZ, this.options.colliders ?? []);
    nextX = resolved.x;
    nextZ = resolved.z;
    if (this.options.ground.heightAt(nextX, nextZ) <= WATER_LINE) {
      // 嘗試僅沿單軸滑動，貼著海岸線走
      if (this.options.ground.heightAt(this.x + dx, this.z) > WATER_LINE) {
        nextX = this.x + dx;
        nextZ = this.z;
      } else if (this.options.ground.heightAt(this.x, this.z + dz) > WATER_LINE) {
        nextX = this.x;
        nextZ = this.z + dz;
      } else {
        nextX = this.x;
        nextZ = this.z;
      }
    }

    const moved = Math.hypot(nextX - this.x, nextZ - this.z);
    this.x = nextX;
    this.z = nextZ;

    // 面向移動方向（平滑轉向）
    if (moved > 1e-5) {
      const targetFacing = Math.atan2(dx, dz);
      let diff = targetFacing - this.facing;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      this.facing += diff * Math.min(1, deltaSeconds * 10);
    }

    this.syncAvatar(deltaSeconds);
    if (this.options.cameraEnabled?.() !== false) this.syncCamera();

    const normalizedSpeed = deltaSeconds > 0 ? Math.min(1, moved / (WALK_SPEED * deltaSeconds)) : 0;
    this.options.onMoveSpeed?.(normalizedSpeed);
    if (input.interact) this.options.onInteract?.(this.x, this.z);
  }

  private syncAvatar(_deltaSeconds: number): void {
    const { avatar, ground } = this.options;
    avatar.position.set(this.x, ground.heightAt(this.x, this.z), this.z);
    avatar.rotation.y = this.facing;
  }

  private syncCamera(): void {
    const { camera } = this.options;
    const characterY = this.options.ground.heightAt(this.x, this.z) + HEAD_HEIGHT;
    const horizontal = this.distance * Math.cos(this.pitch);
    camera.position.set(
      this.x + Math.sin(this.yaw) * horizontal,
      characterY + this.distance * Math.sin(this.pitch),
      this.z + Math.cos(this.yaw) * horizontal
    );
    camera.lookAt(this.x, characterY, this.z);
  }
}
