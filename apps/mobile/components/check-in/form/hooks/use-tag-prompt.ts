import { getTagPromptsByTags } from "@daodao/api";
import type { UseFormReturn } from "react-hook-form";
import type { CheckInFormValuesType } from "../schema";

// Mobile default locale (TODO: integrate with i18n when available)
const DEFAULT_LOCALE = "zh-TW";

/**
 * Hook 用於處理標籤引導句的獲取和更新 description (Mobile)
 */
export const useTagPrompt = (form: UseFormReturn<CheckInFormValuesType>) => {
  /**
   * 取得標籤引導句並更新 description
   */
  const fetchAndAddPrompt = async (tagName: string) => {
    try {
      const response = await getTagPromptsByTags({
        tags: tagName,
        usageType: "practice_checkin",
        locale: DEFAULT_LOCALE,
      });

      const promptsData = response.data?.data;
      if (promptsData && Array.isArray(promptsData) && promptsData.length > 0) {
        // 使用第一個引導句作為提示
        const promptText = promptsData[0]?.prompt;
        if (promptText) {
          const currentDescription = form.getValues("description");
          if (currentDescription.trim()) {
            // 如果 description 已有內容，則追加該 tag 的引導句
            form.setValue("description", `${currentDescription}\n${promptText}`);
          } else {
            form.setValue("description", promptText);
          }
        }
      }
    } catch (error) {
      // 靜默處理錯誤，不影響標籤選擇
      console.error("取得標籤引導句失敗:", error);
    }
  };

  return { fetchAndAddPrompt };
};
