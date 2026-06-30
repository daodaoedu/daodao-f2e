import { useCreatePracticeCheckIn } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { toast } from "@daodao/ui/components/sonner";
import {
  applyOnboardingUpdateFromResponse,
  refreshOnboardingStatus,
} from "@/components/task-guide/onboarding-progress-context";
import { mapMoodTypeToApiMood } from "@/constants/mood";
import { useCheckInSuccessDialog } from "@/hooks/use-check-in-success-dialog";
import type { ICheckInFormData } from "../../types";

interface UseCheckInSubmitOptions {
  practiceId: string;
  taskTitle: string;
  progressPercentage?: number;
  onComplete?: (data: ICheckInFormData) => void;
}

/**
 * Hook 用於處理打卡提交邏輯
 */
export const useCheckInSubmit = ({
  practiceId,
  taskTitle,
  progressPercentage = 0,
  onComplete,
}: UseCheckInSubmitOptions) => {
  const t = useTranslations("check_in");
  const { createCheckIn } = useCreatePracticeCheckIn(practiceId);
  const { openSuccessDialog } = useCheckInSuccessDialog({
    title: taskTitle,
  });

  const submitCheckIn = async (data: ICheckInFormData) => {
    // 顯示 loading toast
    const loadingToast = toast.loading(t("checking_in"));

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
      if (!applyOnboardingUpdateFromResponse(response)) {
        refreshOnboardingStatus();
      }

      // 關閉 loading toast
      toast.dismiss(loadingToast);

      // 從 API response 中取得新進度百分比和鼓勵句
      const responseData = response.data as
        | { practiceProgressPercentage?: number; encouragement?: string }
        | undefined;
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
      await openSuccessDialog(progressPercentage, newProgressPercentage, encouragement);

      onComplete?.(data);
    } catch (error) {
      // 關閉 loading toast
      toast.dismiss(loadingToast);

      // 顯示錯誤提示
      const errorMessage = error instanceof Error ? error.message : t("check_in_failed");
      console.error("Check-in failed:", error);
      toast.error(errorMessage);
      throw error;
    }
  };

  return { submitCheckIn };
};
