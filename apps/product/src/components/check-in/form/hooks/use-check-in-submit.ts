import { useCreatePracticeCheckIn } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { toast } from "@daodao/ui/components/sonner";
import { mapMoodTypeToApiMood } from "@/constants/mood";
import { useCheckInSuccessDialog } from "@/hooks/use-check-in-success-dialog";
import { useServerErrorMessage } from "@/lib/server-error/use-server-error-message";
import type { ICheckInFormData } from "../../types";
import { runCheckInCreate } from "../check-in-submit-flow";

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
  const { errorMessage } = useServerErrorMessage();
  const { createCheckIn } = useCreatePracticeCheckIn(practiceId);
  const { openSuccessDialog } = useCheckInSuccessDialog({
    title: taskTitle,
  });

  /**
   * @param options.onCreated 打卡建立成功、顯示成功對話框之前呼叫（用來關閉打卡 sheet）。
   *   建立失敗時不呼叫，並顯示錯誤 toast 後把錯誤往上丟（daodao#377）。
   */
  const submitCheckIn = async (data: ICheckInFormData, options?: { onCreated?: () => void }) => {
    // 顯示 loading toast
    const loadingToast = toast.loading(t("checking_in"));

    await runCheckInCreate({
      // 使用封裝好的函數創建打卡記錄（自動處理圖片上傳和 cache 刷新）
      create: () =>
        createCheckIn({
          // 將前端的 MoodType 映射到 API 的 ApiMoodType
          mood: mapMoodTypeToApiMood(data.mood),
          tags: data.tags,
          description: data.description,
          media: data.media,
        }),
      onCreated: () => {
        toast.dismiss(loadingToast);
        options?.onCreated?.();
      },
      onError: (error) => {
        toast.dismiss(loadingToast);
        console.error("Check-in failed:", error);
        toast.error(errorMessage(error, t("check_in_failed")));
      },
      onSuccess: async (response) => {
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
      },
    });
  };

  return { submitCheckIn };
};
