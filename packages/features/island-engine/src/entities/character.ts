/**
 * 操控角色分身：GLB（缺檔自動 fallback）＋程式化走路動畫
 *
 * spike 教訓：動畫必須疊加在資產基準 transform 上（base + offset），
 * 不可覆寫 position——root 由 CharacterController 管，動畫只動 inner。
 */

import { Group, type Object3D } from "three";
import type { IAssetLoader } from "../assets/loader";
import { ISLAND_ASSETS } from "../assets/manifest";
import type { IUpdatable } from "../core/engine";

export interface ICharacterAvatar extends IUpdatable {
  /** 根節點：position/rotation 由 CharacterController 控制 */
  root: Group;
  /** 由控制器每幀回報移動速度（0..1），驅動彈跳與 squash & stretch */
  setMoveSpeed(normalizedSpeed: number): void;
}

/**
 * 建立角色分身。personaType 對應素材 key（目前僅 role-d 有素材，
 * 其餘人格待 task 5.1 量產後於 manifest 補上；缺檔一律 fallback 幾何體）。
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

  // 記錄資產基準 transform，動畫以此為底疊加
  const baseY = model.position.y;
  const baseScale = model.scale.clone();

  let moveSpeed = 0;
  let phase = 0;

  return {
    root,
    setMoveSpeed(normalizedSpeed: number): void {
      moveSpeed = normalizedSpeed;
    },
    update(deltaSeconds: number): void {
      // 走路彈跳：速度驅動頻率與振幅；靜止時緩慢呼吸
      const target: Object3D = model;
      if (moveSpeed > 0.05) {
        phase += deltaSeconds * (6 + moveSpeed * 6);
        const bounce = Math.abs(Math.sin(phase)) * 0.22 * moveSpeed;
        const squash = 1 + Math.sin(phase * 2) * 0.08 * moveSpeed;
        target.position.y = baseY + bounce;
        target.scale.set(baseScale.x / squash, baseScale.y * squash, baseScale.z / squash);
      } else {
        phase += deltaSeconds * 2;
        const breathe = 1 + Math.sin(phase) * 0.02;
        target.position.y = baseY;
        target.scale.set(baseScale.x, baseScale.y * breathe, baseScale.z);
      }
    },
  };
};
