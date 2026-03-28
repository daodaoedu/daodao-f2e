import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { captureRef } from "react-native-view-shot";
import { CheckInCard } from "../../display/check-in-card";
import type { ICheckInFormData } from "../../types";

interface IUseCheckInImageRenderOptions {
  taskTitle: string;
  onComplete: (data: ICheckInFormData & { renderedImageUri?: string }) => Promise<void> | void;
  onReset: () => void;
}

/**
 * Hook 用於處理打卡圖片渲染邏輯 (Mobile)
 * 使用 react-native-view-shot 進行視圖截圖
 */
export const useCheckInImageRender = ({
  taskTitle,
  onComplete,
  onReset,
}: IUseCheckInImageRenderOptions) => {
  // 用於截圖的視圖 ref
  const viewShotRef = useRef<View>(null);

  // 狀態：是否正在等待渲染圖片
  const [isRendering, setIsRendering] = useState(false);
  // 狀態：保存待提交的表單資料
  const [pendingFormData, setPendingFormData] = useState<ICheckInFormData | null>(null);

  // 準備今天的日期字串
  const getTodayDateString = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // 截圖並提交
  const captureAndSubmit = useCallback(async () => {
    if (!pendingFormData || !viewShotRef.current) return;

    try {
      // 延遲一小段時間確保渲染完成
      await new Promise((resolve) => setTimeout(resolve, 100));

      // 使用 react-native-view-shot 截圖
      const uri = await captureRef(viewShotRef, {
        format: "jpg",
        quality: 0.9,
      });

      // 將截圖 URI 加入表單資料
      const finalFormData: ICheckInFormData & { renderedImageUri?: string } = {
        ...pendingFormData,
        renderedImageUri: uri,
      };

      // 重置狀態
      setIsRendering(false);
      setPendingFormData(null);

      // 提交表單
      await onComplete(finalFormData);
      onReset();
    } catch (error) {
      console.error("截圖失敗:", error);
      // 截圖失敗時，仍然提交原始資料
      setIsRendering(false);
      setPendingFormData(null);
      await onComplete(pendingFormData);
      onReset();
    }
  }, [pendingFormData, onComplete, onReset]);

  // 當有待處理的表單資料時，進行截圖
  useEffect(() => {
    if (isRendering && pendingFormData) {
      // 延遲執行以確保組件已渲染
      const timer = setTimeout(captureAndSubmit, 300);
      return () => clearTimeout(timer);
    }
  }, [isRendering, pendingFormData, captureAndSubmit]);

  // 超時處理：如果渲染超過 10 秒，則直接提交（不包含渲染圖片）
  useEffect(() => {
    if (!isRendering || !pendingFormData) return;

    const timeout = setTimeout(async () => {
      // 超時後直接提交，不包含渲染圖片
      setIsRendering(false);
      setPendingFormData(null);

      // 提交表單
      await onComplete(pendingFormData);
      onReset();
    }, 10000);

    return () => clearTimeout(timeout);
  }, [isRendering, pendingFormData, onComplete, onReset]);

  // 開始渲染流程
  const startRender = async (formData: ICheckInFormData) => {
    // 設置狀態，觸發隱藏的 CheckInCard 渲染
    setPendingFormData(formData);
    setIsRendering(true);
  };

  // 渲染用的 CheckInCard 組件
  const renderCheckInCard = (): ReactNode => {
    if (!isRendering || !pendingFormData) return null;

    const todayDateString = getTodayDateString();

    return (
      <View style={styles.offscreenContainer}>
        <View ref={viewShotRef} collapsable={false} style={styles.cardContainer}>
          <CheckInCard
            taskTitle={taskTitle}
            date={todayDateString}
            mood={pendingFormData.mood}
            content={pendingFormData.description}
            tags={pendingFormData.tags}
            images={pendingFormData.mediaUris}
          />
        </View>
      </View>
    );
  };

  return {
    isRendering,
    startRender,
    renderCheckInCard,
  };
};

const styles = StyleSheet.create({
  offscreenContainer: {
    position: "absolute",
    left: -9999,
    top: -9999,
    opacity: 0,
  },
  cardContainer: {
    backgroundColor: "#16B9B3", // Primary background for the card
  },
});
