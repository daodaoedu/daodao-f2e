import { useCreatePracticeCheckIn } from "@daodao/api";
import { toast } from "@daodao/ui/components/sonner";
import { mapMoodTypeToApiMood } from "@/constants/mood";
import { useCheckInSuccessDialog } from "@/hooks/use-check-in-success-dialog";
import type { ICheckInFormData } from "../../types";

interface UseCheckInSubmitOptions {
  practiceId: string;
  taskTitle: string;
  progressPercentage?: number;
  onComplete?: (data: ICheckInFormData) => void;
  /** Phase 2 回調：打卡成功後使用者選擇「繼續分享心得」時呼叫，帶入打卡記錄 ID */
  onOpenPhase2?: (checkInId: string) => void;
}

/**
 * Hook 用於處理打卡提交邏輯
 */
export const useCheckInSubmit = ({
  practiceId,
  taskTitle,
  progressPercentage = 0,
  onComplete,
  onOpenPhase2,
}: UseCheckInSubmitOptions) => {
  const { createCheckIn } = useCreatePracticeCheckIn(practiceId);
  const { openSuccessDialog } = useCheckInSuccessDialog({
    title: taskTitle,
  });

  const submitCheckIn = async (data: ICheckInFormData) => {
    // 顯示 loading toast
    const loadingToast = toast.loading("打卡中...");

    try {
      // 將前端的 MoodType 映射到 API 的 ApiMoodType
      const apiMood = mapMoodTypeToApiMood(data.mood);

      // 構建符合 API 格式的資料
      const apiFormData = {
        mood: apiMood,
        tags: data.tags,
        description: data.description,
        media: data.media,
      };

      // 使用封裝好的函數創建打卡記錄（自動處理圖片上傳和 cache 刷新）
      const response = await createCheckIn(apiFormData);

      // 關閉 loading toast
      toast.dismiss(loadingToast);

      // 從 API response 中取得打卡記錄 ID、新進度百分比和鼓勵句
      const responseData = response.data as
        | { id?: number; practiceProgressPercentage?: number; encouragement?: string }
        | undefined;
      const checkInId =
        responseData && "id" in responseData && typeof responseData.id === "number"
          ? String(responseData.id)
          : undefined;
      const newProgressPercentage =
        responseData &&
        "practiceProgressPercentage" in responseData &&
        typeof responseData.practiceProgressPercentage === "number"
          ? responseData.practiceProgressPercentage
          : progressPercentage;
      const encouragement =
        responseData &&
        "encouragement" in responseData &&
        typeof responseData.encouragement === "string"
          ? responseData.encouragement
          : undefined;

      // 顯示成功對話框
      const from = progressPercentage;
      const to = newProgressPercentage;
      const result = await openSuccessDialog(from, to, encouragement);

      if (result.value === "share" && checkInId && onOpenPhase2) {
        // 使用者選擇繼續分享心得，開啟 Phase 2 Sheet
        onOpenPhase2(checkInId);
      } else if (result.value === "complete") {
        // 成功對話框關閉後，執行原本的完成回調
        onComplete?.(data);
      }
    } catch (error) {
      // 關閉 loading toast
      toast.dismiss(loadingToast);

      // 顯示錯誤提示
      const errorMessage = error instanceof Error ? error.message : "打卡失敗，請稍後再試";
      console.error("打卡失敗:", error);
      toast.error(errorMessage);
      throw error;
    }
  };

  return { submitCheckIn };
};
