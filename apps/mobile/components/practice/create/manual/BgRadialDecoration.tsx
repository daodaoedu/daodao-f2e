import BgRadialSvg from "@daodao/assets/images/dashboard/bg-radial.svg";
import CompassSvg from "@daodao/assets/images/dashboard/compass.svg";
import NotebookSvg from "@daodao/assets/images/dashboard/notebook.svg";
import { MotiView } from "moti";
import { useMemo } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";

/**
 * product `BgRadialAnimation` 分兩層（apps/product/.../bg-radial-animation.tsx）：
 *
 * 1. BgRadialSvg：`absolute ... -z-10`  → 背景放射線，在所有內容最底
 * 2. notebook / compass：`absolute ... z-10` → 浮在卡片之上，不可被 overview card 裁切
 *
 * RN 的 zIndex 只在同層 sibling 生效，因此必須拆成兩個 sibling layer，
 * 由 step5 root 依序疊：radial(0) → content(1) → floats(10)。
 *
 * 錨點：實踐名稱中心（與 product h1.relative 相同）
 * 偏移：`-translate-y-[calc(50%-44px)]` → marginTop = -(H/2 - 44)
 * mobile notebook: x-148 y-140；compass: x+140 y+12（相對畫布中心）
 */

export type DecorationAnchor = {
  /** 名稱中心 X（相對 step5 root） */
  centerX: number;
  /** 名稱中心 Y（相對 step5 root） */
  centerY: number;
};

function useDecorationCanvas() {
  const { width: screenW } = useWindowDimensions();
  const canvasW = Math.min(screenW - 16, 360);
  const scale = canvasW / 558;
  const canvasH = 517 * scale;
  return { canvasW, canvasH, scale };
}

function useCanvasLayout(canvasW: number, canvasH: number, scale: number) {
  return useMemo(() => {
    const cx = canvasW / 2;
    const cy = canvasH / 2;
    const notebookW = 150 * scale;
    const notebookH = 116 * scale;
    const compassW = 109 * scale;
    const compassH = 114 * scale;
    return {
      notebook: {
        left: cx - 148 * scale - notebookW / 2,
        top: cy - 140 * scale - notebookH / 2,
        width: notebookW,
        height: notebookH,
      },
      compass: {
        left: cx + 140 * scale - compassW / 2,
        top: cy + 12 * scale - compassH / 2,
        width: compassW,
        height: compassH,
      },
    };
  }, [canvasW, canvasH, scale]);
}

/** 畫布外框 style：錨在名稱中心，product translateY(-50% + 44) */
function canvasFrameStyle(anchor: DecorationAnchor, canvasW: number, canvasH: number) {
  return {
    position: "absolute" as const,
    left: anchor.centerX,
    top: anchor.centerY,
    width: canvasW,
    height: canvasH,
    marginLeft: -canvasW / 2,
    marginTop: -(canvasH / 2 - 44),
    overflow: "visible" as const,
  };
}

/**
 * 背景放射線 — 最底層（product -z-10）
 */
export function BgRadialLayer({ anchor }: { anchor: DecorationAnchor | null }) {
  const { canvasW, canvasH } = useDecorationCanvas();
  if (!anchor) return null;

  return (
    <View
      pointerEvents="none"
      style={[canvasFrameStyle(anchor, canvasW, canvasH), styles.radialLayer]}
    >
      <BgRadialSvg width={canvasW} height={canvasH} />
    </View>
  );
}

/**
 * 筆記本 + 指南針 — 最上層（product z-10），可壓在 overview card 上
 */
export function BgFloatIconsLayer({ anchor }: { anchor: DecorationAnchor | null }) {
  const { canvasW, canvasH, scale } = useDecorationCanvas();
  const layout = useCanvasLayout(canvasW, canvasH, scale);
  if (!anchor) return null;

  return (
    <View
      pointerEvents="none"
      style={[canvasFrameStyle(anchor, canvasW, canvasH), styles.floatLayer]}
    >
      <MotiView
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "timing", duration: 700, delay: 100 }}
        style={[
          styles.float,
          {
            left: layout.notebook.left,
            top: layout.notebook.top,
            width: layout.notebook.width,
            height: layout.notebook.height,
          },
        ]}
      >
        <NotebookSvg width={layout.notebook.width} height={layout.notebook.height} />
      </MotiView>

      <MotiView
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "timing", duration: 800 }}
        style={[
          styles.float,
          {
            left: layout.compass.left,
            top: layout.compass.top,
            width: layout.compass.width,
            height: layout.compass.height,
          },
        ]}
      >
        <CompassSvg width={layout.compass.width} height={layout.compass.height} />
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  /** product: -z-10 — 背景在最底，不蓋住卡片 */
  radialLayer: {
    zIndex: 0,
  },
  /**
   * product: z-10 — 高於 content
   * Android elevation 需高於卡片 shadow，否則仍會被蓋住
   */
  floatLayer: {
    zIndex: 10,
    elevation: 12,
  },
  float: {
    position: "absolute",
  },
});
