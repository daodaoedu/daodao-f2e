import type { CapturedImageData } from "@daodao/shared";
import { format } from "date-fns";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { CheckInCard } from "../../display/check-in-card";
import type { ICheckInFormData } from "../../types";
import { convertMediaToUrls, dataURLtoFile } from "../utils";

interface UseCheckInImageRenderOptions {
  taskTitle: string;
  onComplete: (data: ICheckInFormData) => Promise<void> | void;
  onReset: () => void;
}

/**
 * Hook 用於處理打卡圖片渲染邏輯
 */
export const useCheckInImageRender = ({
  taskTitle,
  onComplete,
  onReset,
}: UseCheckInImageRenderOptions) => {
  // 狀態：是否正在等待渲染圖片
  const [isRendering, setIsRendering] = useState(false);
  // 狀態：保存待提交的表單資料
  const [pendingFormData, setPendingFormData] = useState<ICheckInFormData | null>(null);
  // 狀態：渲染用的圖片 URL 陣列
  const [renderImageUrls, setRenderImageUrls] = useState<string[]>([]);

  // 超時處理：如果渲染超過 10 秒，則直接提交（不包含渲染圖片）
  useEffect(() => {
    if (!isRendering || !pendingFormData) return;

    const timeout = setTimeout(async () => {
      // 超時後直接提交，不包含渲染圖片
      const finalFormData: ICheckInFormData = {
        ...pendingFormData,
      };

      setIsRendering(false);
      setPendingFormData(null);
      setRenderImageUrls([]);

      // 提交表單
      await onComplete(finalFormData);
      onReset();
    }, 10000);

    return () => {
      clearTimeout(timeout);
    };
  }, [isRendering, pendingFormData, onComplete, onReset]);

  // 處理 CheckInCard 產生的 maskedImageData
  const handleMaskedImageReady = async (maskedImageData: CapturedImageData) => {
    if (!pendingFormData) return;

    // 將 maskedImageData 轉換為 File
    const renderedImageFile = dataURLtoFile(maskedImageData.src, "check-in-rendered.jpg");

    // 過濾掉舊的渲染圖片（如果存在）
    const mediaWithoutRendered = pendingFormData.media.filter(
      (file) => file.name !== "check-in-rendered.jpg"
    );

    // 將新的渲染圖片插入到第一個位置
    const finalFormData: ICheckInFormData = {
      ...pendingFormData,
      media: [renderedImageFile, ...mediaWithoutRendered],
    };

    // 重置狀態
    setIsRendering(false);
    setPendingFormData(null);
    setRenderImageUrls([]);

    // 提交表單
    await onComplete(finalFormData);
    onReset();
  };

  // 開始渲染流程
  const startRender = async (formData: ICheckInFormData) => {
    // 轉換 media 為 URL 陣列
    const imageUrls = await convertMediaToUrls(formData.media);

    // 設置狀態，觸發隱藏的 CheckInCard 渲染
    setPendingFormData(formData);
    setRenderImageUrls(imageUrls);
    setIsRendering(true);
  };

  // 準備今天的日期字串
  const todayDateString = format(new Date(), "yyyy-MM-dd");

  // 渲染用的 CheckInCard 組件
  const renderCheckInCard = (): ReactNode => {
    if (!isRendering || !pendingFormData) return null;

    return (
      <div className="fixed -left-[9999px] -top-[9999px] opacity-0 pointer-events-none">
        <CheckInCard
          key="render-check-in-card"
          taskTitle={taskTitle}
          date={todayDateString}
          mood={pendingFormData.mood}
          content={pendingFormData.description}
          tags={pendingFormData.tags}
          images={renderImageUrls}
          showTape={false}
          onMaskedImageReady={handleMaskedImageReady}
        />
      </div>
    );
  };

  return {
    isRendering,
    startRender,
    renderCheckInCard,
  };
};
