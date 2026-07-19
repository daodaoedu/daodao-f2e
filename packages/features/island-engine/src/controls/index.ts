/**
 * controls 模組：第三人稱角色操控
 * - 桌機：WASD/方向鍵＋滑鼠視角＋滾輪縮放（keyboard-mouse.ts，task 3.4）
 * - 手機：虛擬搖杆＋單指視角＋雙指縮放（touch.ts，task 3.5）
 * - 角色控制器：camera-relative 移動、貼地、擋牆（character-controller.ts）
 */

/** 每幀輸入狀態：各輸入源 consumeFrame() 輸出，控制器消費 */
export interface IControlInputState {
  /** 移動方向（-1..1，螢幕/相機座標系：x 右、z 前後） */
  moveX: number;
  moveZ: number;
  /** 視角增量（弧度） */
  lookDeltaX: number;
  lookDeltaY: number;
  /** 縮放增量（正值拉遠） */
  zoomDelta: number;
  /** 本幀是否按下互動鍵（走近建築＋互動鍵開詳情） */
  interact: boolean;
}

export interface IInputSource {
  /** 讀取並清空本幀的累積輸入 */
  consumeFrame(): IControlInputState;
  dispose(): void;
}

/**
 * camera-relative 移動向量 → world 位移（純函式，可單元測試）
 * yaw 為相機水平角；輸入 moveZ 負值 = 朝相機前方
 */
export const computeWorldMove = (
  moveX: number,
  moveZ: number,
  yaw: number,
  speed: number,
  deltaSeconds: number
): { dx: number; dz: number } => {
  const length = Math.hypot(moveX, moveZ);
  if (length < 1e-6) return { dx: 0, dz: 0 };
  const sin = Math.sin(yaw);
  const cos = Math.cos(yaw);
  // 相機座標 → world：前方 = (-sin, -cos)、右方 = (cos, -sin)
  const dirX = moveX * cos + moveZ * sin;
  const dirZ = moveX * -sin + moveZ * cos;
  const norm = Math.hypot(dirX, dirZ);
  if (norm < 1e-6) return { dx: 0, dz: 0 };
  const scale = (Math.min(length, 1) * speed * deltaSeconds) / norm;
  return { dx: dirX * scale, dz: dirZ * scale };
};

export { CharacterController, type ICharacterControllerOptions } from "./character-controller";
export { createKeyboardMouseInput } from "./keyboard-mouse";
export { createTouchInput } from "./touch";
