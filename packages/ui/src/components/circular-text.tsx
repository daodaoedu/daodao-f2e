"use client";

import * as React from "react";

import { cn } from "../lib/utils";

export interface CircularTextProps {
  /**
   * 圓形的直徑（像素）
   * @default 200
   */
  size?: number;
  /**
   * 要繞圓顯示的文字內容
   * 文字會自動擴展字間距填滿整個圓周
   */
  text?: string;
  /**
   * 中心內容（可以是日期、數字等）
   */
  centerContent?: React.ReactNode;
  /**
   * 文字樣式的 className
   */
  textClassName?: string;
  /**
   * 中心內容的 className
   */
  centerClassName?: string;
  /**
   * 容器的 className
   */
  className?: string;
  /**
   * 文字距離圓心的半徑比例（0-1）
   * @default 0.85
   */
  textRadius?: number;
  /**
   * 文字大小（相對於 size 的比例）
   * @default 0.08
   */
  fontSize?: number;
  /**
   * 額外的字間距留白（像素）
   * 會在自動計算的間距基礎上額外增加這個留白
   * @default 0
   */
  additionalSpacing?: number;
}

/**
 * 文字繞圓元件，用於創建印章樣式的圓形文字效果
 * 文字會自動擴展字間距填滿整個圓周
 *
 * @example
 * ```tsx
 * <CircularText
 *   text="Practice Checked In • "
 *   centerContent={
 *     <>
 *       <div>2026</div>
 *       <div>01/01</div>
 *     </>
 *   }
 * />
 * ```
 */
export const CircularText = React.forwardRef<SVGSVGElement, CircularTextProps>(
  (
    {
      size = 200,
      text = "",
      centerContent,
      textClassName,
      centerClassName,
      className,
      textRadius = 0.85,
      fontSize = 0.08,
      additionalSpacing = 0,
    },
    ref
  ) => {
    const center = size / 2;
    const radius = center * textRadius;
    const id = React.useId();
    const pathId = `${id}-circle`;
    const measureTextRef = React.useRef<SVGTextElement>(null);
    const [letterSpacing, setLetterSpacing] = React.useState<number | undefined>(undefined);

    // 計算圓周長度（這就是文字應該佔據的總長度）
    const circumference = 2 * Math.PI * radius;

    // 測量文字寬度並計算字間距
    React.useEffect(() => {
      if (!text || !measureTextRef.current) {
        setLetterSpacing(undefined);
        return;
      }

      const measureText = () => {
        if (!measureTextRef.current) return;

        // 測量原始文字寬度（不含間距）
        const textWidth = measureTextRef.current.getComputedTextLength();

        if (textWidth === 0 || Number.isNaN(textWidth) || text.length === 0) {
          setLetterSpacing(undefined);
          return;
        }

        // 計算需要的總間距 = 圓周長度 - 文字寬度
        const totalSpacing = circumference - textWidth;

        // 計算每個字元之間的平均間距（包括最後一個字元和第一個字元之間）
        // 因為是圓形，所以間距數量等於字元數量
        const baseSpacing = totalSpacing / text.length;

        // 加上用戶指定的額外留白
        const spacing = baseSpacing + additionalSpacing;

        setLetterSpacing(spacing);
      };

      requestAnimationFrame(measureText);
    }, [text, circumference, additionalSpacing]);

    // 創建完整的圓形路徑（從頂部開始，順時針繞一圈）
    // 使用兩個半圓弧組成完整的圓
    const circlePath = `M ${center},${center - radius} A ${radius},${radius} 0 0,1 ${center},${center + radius} A ${radius},${radius} 0 0,1 ${center},${center - radius}`;

    return (
      <div className={cn("relative inline-flex items-center justify-center", className)}>
        <svg
          ref={ref}
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="overflow-visible"
          role="img"
          aria-label={text || "Circular text"}
        >
          <defs>
            {/* 完整圓形路徑 */}
            <path id={pathId} d={circlePath} fill="none" />
          </defs>

          {/* 隱藏的測量文字元素 */}
          {text && (
            <text
              ref={measureTextRef}
              className={cn("fill-current", textClassName)}
              fontSize={size * fontSize}
              style={{
                visibility: "hidden",
                position: "absolute",
              }}
            >
              {text}
            </text>
          )}

          {/* 繞圓文字 */}
          {text && (
            <text
              className={cn("fill-current", textClassName)}
              fontSize={size * fontSize}
              textAnchor="start"
              letterSpacing={letterSpacing !== undefined ? `${letterSpacing}px` : undefined}
            >
              <textPath href={`#${pathId}`} startOffset="0%">
                {text}
              </textPath>
            </text>
          )}
        </svg>

        {/* 中心內容 */}
        {centerContent && (
          <div
            className={cn(
              "absolute inset-0 flex flex-col items-center justify-center",
              centerClassName
            )}
          >
            {centerContent}
          </div>
        )}
      </div>
    );
  }
);

CircularText.displayName = "CircularText";
