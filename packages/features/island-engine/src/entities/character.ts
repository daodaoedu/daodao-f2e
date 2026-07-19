/**
 * 操控角色分身：GLB（缺檔自動 fallback）＋動畫
 *
 * - rigged 模型（含 Idle / Walking 剪輯，如 KayKit 替身）：AnimationMixer
 *   以權重 crossfade 切換 idle/走路
 * - 無骨架模型（fallback 幾何體或未來的泡泡吉祥物）：程式化彈跳＋
 *   squash & stretch（spike 教訓：動畫疊加在資產基準 transform 上，
 *   不可覆寫 position——root 由 CharacterController 管，動畫只動 inner）
 */

import { type AnimationClip, AnimationMixer, Group } from "three";
import type { IAssetLoader } from "../assets/loader";
import { ISLAND_ASSETS } from "../assets/manifest";
import type { IUpdatable } from "../core/engine";

export interface ICharacterAvatar extends IUpdatable {
  /** 根節點：position/rotation 由 CharacterController 控制 */
  root: Group;
  /** 由控制器每幀回報移動速度（0..1），驅動走路動畫 */
  setMoveSpeed(normalizedSpeed: number): void;
}

const IDLE_CLIP_NAMES = ["Idle", "Idle_A", "2H_Melee_Idle"];
const WALK_CLIP_NAMES = ["Walking_A", "Walking_B", "Running_A"];

const findClip = (clips: AnimationClip[], names: string[]): AnimationClip | null => {
  for (const name of names) {
    const clip = clips.find((item) => item.name === name);
    if (clip) return clip;
  }
  return null;
};

/**
 * 建立角色分身。personaType 對應素材 key（目前以 KayKit 替身通用，
 * 五人格分身待吉祥物設計定案後於 manifest 補上；缺檔一律 fallback 幾何體）。
 */
export const createCharacterAvatar = async (
  loader: IAssetLoader,
  _personaType: string | null
): Promise<ICharacterAvatar> => {
  const root = new Group();
  root.name = "island-character";

  const inner = new Group();
  inner.name = "island-character-inner";
  root.add(inner);

  const model = await loader.load(ISLAND_ASSETS.characterRoleD);
  inner.add(model);

  const clips = (model.userData.animations as AnimationClip[] | undefined) ?? [];
  const idleClip = findClip(clips, IDLE_CLIP_NAMES);
  const walkClip = findClip(clips, WALK_CLIP_NAMES);

  let moveSpeed = 0;

  // ---------- rigged 路線：AnimationMixer crossfade ----------
  if (idleClip && walkClip) {
    const mixer = new AnimationMixer(model);
    const idleAction = mixer.clipAction(idleClip);
    const walkAction = mixer.clipAction(walkClip);
    idleAction.play();
    walkAction.play();
    walkAction.weight = 0;
    let walkWeight = 0;

    return {
      root,
      setMoveSpeed(normalizedSpeed: number): void {
        moveSpeed = normalizedSpeed;
      },
      update(deltaSeconds: number): void {
        // 權重朝目標速度收斂（快速但平滑的 crossfade）
        const target = moveSpeed > 0.05 ? 1 : 0;
        walkWeight += (target - walkWeight) * Math.min(1, deltaSeconds * 10);
        walkAction.weight = walkWeight;
        idleAction.weight = 1 - walkWeight;
        walkAction.timeScale = 0.8 + moveSpeed * 0.5;
        mixer.update(deltaSeconds);
      },
    };
  }

  // ---------- 無骨架路線：程式化彈跳（base + offset） ----------
  const baseY = model.position.y;
  const baseScale = model.scale.clone();
  let phase = 0;

  return {
    root,
    setMoveSpeed(normalizedSpeed: number): void {
      moveSpeed = normalizedSpeed;
    },
    update(deltaSeconds: number): void {
      if (moveSpeed > 0.05) {
        phase += deltaSeconds * (6 + moveSpeed * 6);
        const bounce = Math.abs(Math.sin(phase)) * 0.22 * moveSpeed;
        const squash = 1 + Math.sin(phase * 2) * 0.08 * moveSpeed;
        model.position.y = baseY + bounce;
        model.scale.set(baseScale.x / squash, baseScale.y * squash, baseScale.z / squash);
      } else {
        phase += deltaSeconds * 2;
        const breathe = 1 + Math.sin(phase) * 0.02;
        model.position.y = baseY;
        model.scale.set(baseScale.x, baseScale.y * breathe, baseScale.z);
      }
    },
  };
};
