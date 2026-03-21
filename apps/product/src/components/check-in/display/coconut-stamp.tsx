"use client";

import CoconutSvg from "@daodao/assets/images/dashboard/coconut.svg";
import { cn } from "@daodao/ui/lib/utils";
import { useEffect, useRef, useState } from "react";

interface CoconutStampProps {
  /**
   * 是否觸發第一次打卡的放大 + 旋轉光芒動畫
   * 動畫播放一次後停止
   */
  animated?: boolean;
  className?: string;
}

type AnimPhase = "idle" | "burst" | "done";

/**
 * 椰子圖章元件
 * - 靜態顯示：直接渲染椰子印章
 * - 動畫模式（animated=true）：放大彈入 + 背後旋轉光芒（只播一次）
 */
export const CoconutStamp = ({ animated = false, className }: CoconutStampProps) => {
  const [phase, setPhase] = useState<AnimPhase>(animated ? "idle" : "done");
  const t1 = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t2 = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!animated) return;
    // 延遲 300ms 後觸發動畫，讓頁面先渲染完
    t1.current = setTimeout(() => {
      setPhase("burst");
      // 1400ms 後動畫結束，切換到靜態
      t2.current = setTimeout(() => setPhase("done"), 1400);
    }, 300);

    return () => {
      if (t1.current) clearTimeout(t1.current);
      if (t2.current) clearTimeout(t2.current);
    };
  }, [animated]);

  const isAnimating = phase === "burst";

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* 旋轉光芒（只在動畫階段顯示） */}
      {isAnimating && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          aria-hidden="true"
        >
          <svg
            className="absolute animate-spin"
            style={{ animationDuration: "3.5s", animationTimingFunction: "linear" }}
            width="220"
            height="220"
            viewBox="0 0 220 220"
          >
            {Array.from({ length: 18 }).map((_, i) => {
              const angle = (i * 360) / 18;
              const rad = (angle * Math.PI) / 180;
              const isMajor = i % 2 === 0;
              const innerR = isMajor ? 60 : 64;
              const outerR = isMajor ? 105 : 90;
              const x1 = 110 + innerR * Math.cos(rad);
              const y1 = 110 + innerR * Math.sin(rad);
              const x2 = 110 + outerR * Math.cos(rad);
              const y2 = 110 + outerR * Math.sin(rad);
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#F5A623"
                  strokeWidth={isMajor ? 4 : 2}
                  strokeLinecap="round"
                  opacity={isMajor ? 0.85 : 0.45}
                />
              );
            })}
          </svg>
        </div>
      )}

      {/* 椰子印章本體 */}
      <CoconutSvg
        className={cn(
          "relative z-10 size-24",
          // 動畫中：scale 彈入
          phase === "idle" && "scale-0 opacity-0",
          phase === "burst" &&
            "scale-110 opacity-100 transition-[transform,opacity] duration-300 ease-out",
          phase === "done" && "scale-100 opacity-100 transition-transform duration-150 ease-in-out"
        )}
      />
    </div>
  );
};
