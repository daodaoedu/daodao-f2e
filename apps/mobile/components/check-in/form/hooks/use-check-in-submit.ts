import { useMutate } from "@daodao/api";
import Constants from "expo-constants";
import { Alert } from "react-native";
import { mapMoodTypeToApiMood } from "@/constants/mood";
import { useCheckInSuccessDialog } from "@/hooks/use-check-in-success-dialog";
import { useMobileTranslation } from "@/i18n";
import { authStorage } from "@/services/auth-storage";
import type { ICheckInFormData } from "../../types";

// React Native file-like object for FormData
interface IFormDataFile {
  uri: string;
  type: string;
  name: string;
}

interface IUseCheckInSubmitOptions {
  practiceId: string;
  taskTitle: string;
  progressPercentage?: number;
  onComplete?: (data: ICheckInFormData) => void;
}

/**
 * 從 URI 獲取文件擴展名並返回 MIME 類型
 */
const getMimeType = (uri: string): string => {
  const extension = uri.split(".").pop()?.toLowerCase();
  switch (extension) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "gif":
      return "image/gif";
    case "webp":
      return "image/webp";
    default:
      return "image/jpeg";
  }
};

/**
 * Hook 用於處理打卡提交邏輯 (Mobile)
 */
export const useCheckInSubmit = ({
  practiceId,
  taskTitle,
  progressPercentage = 0,
  onComplete,
}: IUseCheckInSubmitOptions) => {
  const t = useMobileTranslation("mobile.checkIn");
  const mutate = useMutate();
  const { openSuccessDialog } = useCheckInSuccessDialog({
    title: taskTitle,
  });

  const submitCheckIn = async (data: ICheckInFormData) => {
    try {
      // 將前端的 MoodType 映射到 API 的 ApiMoodType
      const apiMood = mapMoodTypeToApiMood(data.mood);

      // 構建 FormData
      const formData = new FormData();

      // 基本欄位
      if (apiMood) formData.append("mood", apiMood);
      if (data.description) formData.append("note", data.description);

      // 陣列欄位需轉成 JSON 字串
      if (data.tags && data.tags.length > 0) {
        formData.append("tags", JSON.stringify(data.tags));
      }

      // 圖片檔案（多張）- React Native 使用 uri, type, name 格式
      if (data.mediaUris && data.mediaUris.length > 0) {
        data.mediaUris.forEach((uri, index) => {
          const fileObject: IFormDataFile = {
            uri,
            type: getMimeType(uri),
            name: `image-${index}.${uri.split(".").pop() || "jpg"}`,
          };
          // React Native FormData accepts this format
          formData.append("images", fileObject as unknown as Blob);
        });
      }

      // 獲取 API URL
      const apiUrl = Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error(t("api_url_missing"));
      }

      // 取得 Bearer token（React Native 不支援 cookie credentials，需明確帶 Authorization header）
      const accessToken = await authStorage.getAccessToken();
      if (!accessToken) {
        throw new Error(t("auth_required"));
      }

      // 發送請求
      const response = await fetch(`${apiUrl}/api/v1/practices/${practiceId}/checkins`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: { message: t("failed") },
        }));
        throw new Error(errorData.error?.message || t("failed"));
      }

      const responseData = await response.json();

      // 刷新打卡列表的 cache
      await mutate([
        "/api/v1/practices/{id}/checkins",
        {
          params: {
            path: {
              id: practiceId,
            },
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

      // 從 API response 中取得新的進度百分比
      const newProgressPercentage =
        responseData &&
        "practiceProgressPercentage" in responseData &&
        typeof responseData.practiceProgressPercentage === "number"
          ? responseData.practiceProgressPercentage
          : progressPercentage;

      // 顯示成功對話框
      const from = progressPercentage;
      const to = newProgressPercentage;
      const result = await openSuccessDialog(from, to);

      if (result.value === "complete") {
        // 成功對話框關閉後，執行原本的完成回調
        onComplete?.(data);
      }
    } catch (error) {
      // 顯示錯誤提示
      const errorMessage = error instanceof Error ? error.message : t("failed_retry");
      console.error("打卡失敗:", error);
      Alert.alert(t("failed"), errorMessage);
      throw error;
    }
  };

  return { submitCheckIn };
};
