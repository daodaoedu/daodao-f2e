/**
 * 桌機輸入源（task 3.4）：WASD/方向鍵移動＋滑鼠拖曳視角＋滾輪縮放＋E/Enter 互動鍵
 */

import type { IControlInputState, IInputSource } from "./index";

const MOVE_KEYS: Record<string, [number, number]> = {
  KeyW: [0, -1],
  ArrowUp: [0, -1],
  KeyS: [0, 1],
  ArrowDown: [0, 1],
  KeyA: [-1, 0],
  ArrowLeft: [-1, 0],
  KeyD: [1, 0],
  ArrowRight: [1, 0],
};

const INTERACT_KEYS = new Set(["KeyE", "Enter"]);

export const createKeyboardMouseInput = (domElement: HTMLElement): IInputSource => {
  const held = new Set<string>();
  let lookDeltaX = 0;
  let lookDeltaY = 0;
  let zoomDelta = 0;
  let interact = false;
  let dragging = false;

  const onKeyDown = (event: KeyboardEvent): void => {
    if (MOVE_KEYS[event.code]) {
      held.add(event.code);
      event.preventDefault();
    }
    if (INTERACT_KEYS.has(event.code)) interact = true;
  };
  const onKeyUp = (event: KeyboardEvent): void => {
    held.delete(event.code);
  };
  const onPointerDown = (event: PointerEvent): void => {
    if (event.button === 0) dragging = true;
  };
  const onPointerUp = (): void => {
    dragging = false;
  };
  const onPointerMove = (event: PointerEvent): void => {
    if (!dragging) return;
    lookDeltaX += event.movementX * 0.005;
    lookDeltaY += event.movementY * 0.005;
  };
  const onWheel = (event: WheelEvent): void => {
    event.preventDefault();
    zoomDelta += event.deltaY * 0.01;
  };
  const onBlur = (): void => {
    held.clear();
    dragging = false;
  };

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", onBlur);
  domElement.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointermove", onPointerMove);
  domElement.addEventListener("wheel", onWheel, { passive: false });

  return {
    consumeFrame(): IControlInputState {
      let moveX = 0;
      let moveZ = 0;
      for (const code of held) {
        const vector = MOVE_KEYS[code];
        if (!vector) continue;
        moveX += vector[0];
        moveZ += vector[1];
      }
      const length = Math.hypot(moveX, moveZ);
      if (length > 1) {
        moveX /= length;
        moveZ /= length;
      }
      const state: IControlInputState = {
        moveX,
        moveZ,
        lookDeltaX,
        lookDeltaY,
        zoomDelta,
        interact,
      };
      lookDeltaX = 0;
      lookDeltaY = 0;
      zoomDelta = 0;
      interact = false;
      return state;
    },
    dispose(): void {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      domElement.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointermove", onPointerMove);
      domElement.removeEventListener("wheel", onWheel);
    },
  };
};
