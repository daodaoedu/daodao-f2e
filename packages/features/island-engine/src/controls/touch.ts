/**
 * 行動裝置輸入源（task 3.5）：左下虛擬搖杆移動＋單指拖曳視角＋雙指縮放
 *
 * 搖杆是貼著 canvas 的輸入配件（非 UI 內容），由 engine 掛在自己的
 * container 內——React 殼不需要知道它的存在。
 * spike 追加發現 tap-to-move 可能取代搖杆，實機驗證後再定案（tasks.md 3.5）。
 */

import type { IControlInputState, IInputSource } from "./index";

const JOYSTICK_SIZE = 112;
const KNOB_SIZE = 48;

const createJoystickDom = (
  container: HTMLElement
): { base: HTMLDivElement; knob: HTMLDivElement } => {
  const base = document.createElement("div");
  base.style.cssText = [
    "position:absolute",
    "left:24px",
    "bottom:32px",
    `width:${JOYSTICK_SIZE}px`,
    `height:${JOYSTICK_SIZE}px`,
    "border-radius:50%",
    "background:rgba(255,255,255,0.22)",
    "border:2px solid rgba(255,255,255,0.5)",
    "touch-action:none",
    "z-index:10",
  ].join(";");

  const knob = document.createElement("div");
  knob.style.cssText = [
    "position:absolute",
    `width:${KNOB_SIZE}px`,
    `height:${KNOB_SIZE}px`,
    `left:${(JOYSTICK_SIZE - KNOB_SIZE) / 2}px`,
    `top:${(JOYSTICK_SIZE - KNOB_SIZE) / 2}px`,
    "border-radius:50%",
    "background:rgba(255,255,255,0.75)",
    "touch-action:none",
  ].join(";");

  base.appendChild(knob);
  container.appendChild(base);
  return { base, knob };
};

export const createTouchInput = (container: HTMLElement, canvas: HTMLElement): IInputSource => {
  // 搖杆需要絕對定位的錨點
  if (window.getComputedStyle(container).position === "static") {
    container.style.position = "relative";
  }
  const { base, knob } = createJoystickDom(container);

  let moveX = 0;
  let moveZ = 0;
  let lookDeltaX = 0;
  let lookDeltaY = 0;
  let zoomDelta = 0;
  let joystickPointerId: number | null = null;
  let lookPointerId: number | null = null;
  let lastLookX = 0;
  let lastLookY = 0;
  let pinchDistance: number | null = null;
  const activeTouches = new Map<number, { x: number; y: number }>();

  const updateKnob = (): void => {
    const range = (JOYSTICK_SIZE - KNOB_SIZE) / 2;
    knob.style.transform = `translate(${moveX * range}px, ${moveZ * range}px)`;
  };

  const onJoystickPointerDown = (event: PointerEvent): void => {
    joystickPointerId = event.pointerId;
    base.setPointerCapture(event.pointerId);
    event.stopPropagation();
  };
  const onJoystickPointerMove = (event: PointerEvent): void => {
    if (event.pointerId !== joystickPointerId) return;
    const rect = base.getBoundingClientRect();
    const dx = (event.clientX - rect.left - JOYSTICK_SIZE / 2) / (JOYSTICK_SIZE / 2);
    const dy = (event.clientY - rect.top - JOYSTICK_SIZE / 2) / (JOYSTICK_SIZE / 2);
    const length = Math.hypot(dx, dy);
    const clamp = length > 1 ? 1 / length : 1;
    moveX = dx * clamp;
    moveZ = dy * clamp;
    updateKnob();
  };
  const onJoystickPointerEnd = (event: PointerEvent): void => {
    if (event.pointerId !== joystickPointerId) return;
    joystickPointerId = null;
    moveX = 0;
    moveZ = 0;
    updateKnob();
  };

  const onCanvasPointerDown = (event: PointerEvent): void => {
    if (event.pointerType !== "touch") return;
    activeTouches.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (activeTouches.size === 1) {
      lookPointerId = event.pointerId;
      lastLookX = event.clientX;
      lastLookY = event.clientY;
    } else {
      // 進入雙指：停止視角拖曳，記錄起始距離
      lookPointerId = null;
      pinchDistance = null;
    }
  };
  const onCanvasPointerMove = (event: PointerEvent): void => {
    if (!activeTouches.has(event.pointerId)) return;
    activeTouches.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (activeTouches.size === 1 && event.pointerId === lookPointerId) {
      lookDeltaX += (event.clientX - lastLookX) * 0.006;
      lookDeltaY += (event.clientY - lastLookY) * 0.006;
      lastLookX = event.clientX;
      lastLookY = event.clientY;
      return;
    }

    if (activeTouches.size >= 2) {
      const points = Array.from(activeTouches.values());
      const first = points[0];
      const second = points[1];
      if (!first || !second) return;
      const distance = Math.hypot(second.x - first.x, second.y - first.y);
      if (pinchDistance !== null) {
        zoomDelta += (pinchDistance - distance) * 0.02;
      }
      pinchDistance = distance;
    }
  };
  const onCanvasPointerEnd = (event: PointerEvent): void => {
    activeTouches.delete(event.pointerId);
    if (event.pointerId === lookPointerId) lookPointerId = null;
    if (activeTouches.size < 2) pinchDistance = null;
    if (activeTouches.size === 1) {
      const [remainingId] = activeTouches.keys();
      const remaining = remainingId !== undefined ? activeTouches.get(remainingId) : undefined;
      if (remainingId !== undefined && remaining) {
        lookPointerId = remainingId;
        lastLookX = remaining.x;
        lastLookY = remaining.y;
      }
    }
  };

  base.addEventListener("pointerdown", onJoystickPointerDown);
  base.addEventListener("pointermove", onJoystickPointerMove);
  base.addEventListener("pointerup", onJoystickPointerEnd);
  base.addEventListener("pointercancel", onJoystickPointerEnd);
  canvas.addEventListener("pointerdown", onCanvasPointerDown);
  canvas.addEventListener("pointermove", onCanvasPointerMove);
  canvas.addEventListener("pointerup", onCanvasPointerEnd);
  canvas.addEventListener("pointercancel", onCanvasPointerEnd);

  return {
    consumeFrame(): IControlInputState {
      const state: IControlInputState = {
        moveX,
        moveZ,
        lookDeltaX,
        lookDeltaY,
        zoomDelta,
        interact: false,
      };
      lookDeltaX = 0;
      lookDeltaY = 0;
      zoomDelta = 0;
      return state;
    },
    dispose(): void {
      base.removeEventListener("pointerdown", onJoystickPointerDown);
      base.removeEventListener("pointermove", onJoystickPointerMove);
      base.removeEventListener("pointerup", onJoystickPointerEnd);
      base.removeEventListener("pointercancel", onJoystickPointerEnd);
      canvas.removeEventListener("pointerdown", onCanvasPointerDown);
      canvas.removeEventListener("pointermove", onCanvasPointerMove);
      canvas.removeEventListener("pointerup", onCanvasPointerEnd);
      canvas.removeEventListener("pointercancel", onCanvasPointerEnd);
      base.remove();
    },
  };
};
