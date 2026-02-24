"use client";

import {
  captureElementAsImage,
  type CapturedImageData,
} from "@daodao/shared";
import { useCallback, useRef, useState } from "react";

interface UsePracticeSummaryImageOptions {
  /** 實踐名稱，用於下載檔案命名 */
  practiceName: string;
  /** 圖片生成超時時間（毫秒），預設 10000 */
  timeout?: number;
}

interface UsePracticeSummaryImageReturn {
  /** 摘要卡片的 ref，需要綁定到 PracticeSummaryCard */
  summaryCardRef: React.RefObject<HTMLDivElement | null>;
  /** 是否正在生成圖片 */
  isGenerating: boolean;
  /** 錯誤訊息 */
  error: string | null;
  /** 生成的圖片資料 */
  imageData: CapturedImageData | null;
  /** 生成圖片 */
  generateImage: () => Promise<CapturedImageData | null>;
  /** 下載圖片 */
  downloadImage: () => Promise<void>;
  /** 重置狀態 */
  reset: () => void;
}

/**
 * 消毒檔案名稱，移除不安全字元
 * @param name 原始檔案名稱
 * @returns 安全的檔案名稱
 */
const sanitizeFilename = (name: string): string => {
  return name
    .replace(/[/\\?%*:|"<>]/g, "-") // 移除不安全字元
    .replace(/^\.+/, "") // 移除開頭的點
    .replace(/\.+$/, "") // 移除結尾的點
    .replace(/\s+/g, "_") // 空白轉底線
    .slice(0, 50)
    .trim() || "practice"; // 確保不為空
};

/**
 * 實踐摘要圖片生成 Hook
 * @description 處理實踐摘要卡片的圖片擷取、下載功能
 */
export const usePracticeSummaryImage = ({
  practiceName,
  timeout = 10000,
}: UsePracticeSummaryImageOptions): UsePracticeSummaryImageReturn => {
  const summaryCardRef = useRef<HTMLDivElement | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageData, setImageData] = useState<CapturedImageData | null>(null);
  // 追蹤是否已取消，用於防止競態條件
  const isCancelledRef = useRef(false);

  /**
   * 生成圖片
   * @returns 生成的圖片資料，如果失敗則返回 null
   */
  const generateImage = useCallback(async (): Promise<CapturedImageData | null> => {
    if (!summaryCardRef.current) {
      setError("找不到摘要卡片元素");
      return null;
    }

    // 重置取消狀態
    isCancelledRef.current = false;
    setIsGenerating(true);
    setError(null);

    // 設置超時計時器
    const timeoutId = setTimeout(() => {
      isCancelledRef.current = true;
      setIsGenerating(false);
      setError("圖片生成超時，請重試");
    }, timeout);

    try {
      const result = await captureElementAsImage(summaryCardRef.current);

      // 清除超時計時器
      clearTimeout(timeoutId);

      // 如果已經超時取消，忽略結果
      if (isCancelledRef.current) {
        return null;
      }

      if (!result) {
        setError("圖片生成失敗");
        setImageData(null);
        return null;
      }

      setImageData(result);
      return result;
    } catch (err) {
      // 清除超時計時器
      clearTimeout(timeoutId);

      // 如果已經超時取消，忽略錯誤
      if (isCancelledRef.current) {
        return null;
      }

      const errorMessage = err instanceof Error ? err.message : "圖片生成發生錯誤";
      setError(errorMessage);
      setImageData(null);
      return null;
    } finally {
      // 只有在未取消時才設置 isGenerating 為 false
      if (!isCancelledRef.current) {
        setIsGenerating(false);
      }
    }
  }, [timeout]);

  /**
   * 下載圖片
   * 如果尚未生成圖片，會先生成再下載
   */
  const downloadImage = useCallback(async (): Promise<void> => {
    let dataToDownload = imageData;

    // 如果還沒有圖片資料，先生成
    if (!dataToDownload) {
      dataToDownload = await generateImage();
    }

    if (!dataToDownload) {
      // 生成失敗，error 已經在 generateImage 中設置
      return;
    }

    try {
      // 檢查是否為 Blob URL
      const isBlobUrl = dataToDownload.src.startsWith("blob:");

      // 建立下載連結
      const link = document.createElement("a");
      link.href = dataToDownload.src;

      // 生成檔案名稱：實踐名稱_日期
      const date = new Date();
      const dateString = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
      const sanitizedName = sanitizeFilename(practiceName);
      link.download = `${sanitizedName}_總結_${dateString}.png`;

      // 觸發下載
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 清理 Blob URL 以防止記憶體洩漏
      if (isBlobUrl) {
        // 延遲釋放，確保下載已開始
        setTimeout(() => {
          URL.revokeObjectURL(dataToDownload.src);
        }, 100);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "下載圖片時發生錯誤";
      setError(errorMessage);
    }
  }, [imageData, generateImage, practiceName]);

  /**
   * 重置狀態
   */
  const reset = useCallback((): void => {
    isCancelledRef.current = true; // 取消任何進行中的操作
    setIsGenerating(false);
    setError(null);
    setImageData(null);
  }, []);

  return {
    summaryCardRef,
    isGenerating,
    error,
    imageData,
    generateImage,
    downloadImage,
    reset,
  };
};
