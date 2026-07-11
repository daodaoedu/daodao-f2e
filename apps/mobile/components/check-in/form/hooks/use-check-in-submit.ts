import { createPracticeCheckInWithFormData, extractApiErrorMessage, useMutate } from "@daodao/api";
import { Alert } from "react-native";
import { mapMoodTypeToApiMood } from "@/constants/mood";
import { useCheckInSuccessDialog } from "@/hooks/use-check-in-success-dialog";
import { applyOnboardingUpdateFromResponse } from "@/hooks/useOnboardingProgress";
import { useMobileTranslation } from "@/i18n";
import { createReactNativeFormDataFile } from "@/utils/form-data-file";
import type { ICheckInFormData } from "../../types";

interface IUseCheckInSubmitOptions {
  practiceId: string;
  taskTitle: string;
  progressPercentage?: number;
  onComplete?: (data: ICheckInFormData) => void;
}

/**
 * Hook 用於處理打卡提交邏輯 (Mobile)
 * 走 FormData + unauthorizedHandler（Bearer token），與 product 對齊
 */
export const useCheckInSubmit = ({
  practiceId,
  taskTitle,
  progressPercentage = 0,
  onComplete,
}: IUseCheckInSubmitOptions) => {
  const t = useMobileTranslation("mobile.checkIn");
  const mutate = useMutate();
  const successDialog = useCheckInSuccessDialog({
    title: taskTitle,
  });

  const submitCheckIn = async (data: ICheckInFormData) => {
    try {
      if (!data.tags || data.tags.length === 0) {
        throw new Error(t("validation_tags_required"));
      }

      const apiMood = mapMoodTypeToApiMood(data.mood);
      const media = (data.mediaUris ?? []).map((uri, index) =>
        createReactNativeFormDataFile(uri, index)
      );

      const response = await createPracticeCheckInWithFormData(practiceId, {
        mood: apiMood,
        tags: data.tags,
        description: data.description ?? "",
        media,
      });

      // 新手任務 D：即時標記「完成第一次打卡」完成
      applyOnboardingUpdateFromResponse(response);

      // 刷新打卡列表的 cache
      await mutate([
        "/api/v1/practices/{id}/checkins",
        {
          params: {
            path: {
              id: practiceId,
            },
            query: {},
          },
        },
      ] as const);

      // 刷新實踐相關的 cache
      await mutate([
        "/api/v1/practices/{id}",
        {
          params: {
            path: {
              id: practiceId,
            },
          },
        },
      ] as const);

      await mutate([
        "/api/v1/me/practices",
        {
          params: {
            query: {},
          },
        },
      ] as const);

      // CheckInWithEncouragement（data 內層）— 對齊 product use-check-in-submit
      const payload =
        response && typeof response === "object" && "data" in response
          ? (response as { data?: Record<string, unknown> }).data
          : undefined;
      const newProgressPercentage =
        payload && typeof payload.practiceProgressPercentage === "number"
          ? payload.practiceProgressPercentage
          : progressPercentage;
      const encouragement =
        payload && typeof payload.encouragement === "string" ? payload.encouragement : undefined;

      // 開啟獨立成功 Dialog（hook 內附 SuccessDialog 元件，呼叫端必須掛載）
      const result = await successDialog.openSuccessDialog(
        progressPercentage,
        newProgressPercentage,
        encouragement
      );

      // product：成功 dialog 關閉後一律 onComplete（不論 complete / dismiss）
      if (result.value === "complete" || result.value === "close") {
        onComplete?.(data);
      }
    } catch (error) {
      const errorMessage = extractApiErrorMessage(error, t("failed_retry"));
      console.error("打卡失敗:", error);
      Alert.alert(t("failed"), errorMessage);
      throw error;
    }
  };

  return {
    submitCheckIn,
    /** 必須掛在 JSX：`{successDialog.SuccessDialog}` */
    successDialog,
  };
};
