"use client";

import { Image } from "./image";
import { cn } from "../lib/utils";
import type { StaticImageData } from "next/image";

interface DialogContentWithImageProps {
  /** 圖片來源 */
  image: StaticImageData;
  /** 圖片 alt 文字 */
  imageAlt: string;
  /** 文字內容 */
  children: React.ReactNode;
  /** 文字對齊方式 */
  textAlign?: "left" | "center";
  /** 容器樣式 */
  containerClassName?: string;
}

/**
 * 統一的 Dialog Content 組件，包含圖片和文字
 *
 * @example
 * ```tsx
 * <DialogContentWithImage
 *   image={WarningPng}
 *   imageAlt="warning"
 *   textAlign="left"
 * >
 *   <p>確定要刪除嗎？</p>
 * </DialogContentWithImage>
 * ```
 */
export function DialogContentWithImage({
  image,
  imageAlt,
  children,
  textAlign = "left",
  containerClassName = "p-4",
}: DialogContentWithImageProps) {
  return (
    <div className={containerClassName}>
      <Image
        src={image}
        alt={imageAlt}
        width={172}
        height={172}
        className="mx-auto pb-8"
      />
      <div
        className={cn(
          "text-text-dark",
          textAlign === "left" ? "text-left" : "text-center"
        )}
      >
        {children}
      </div>
    </div>
  );
}

