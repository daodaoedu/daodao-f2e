import type { useTranslations } from "@daodao/i18n";
import { z } from "zod";

type TFunction = ReturnType<typeof useTranslations<"preferences_settings">>;

/**
 * 偏好設定表單的 schema
 * 每個偏好類型對應一個選項 ID 陣列
 * 注意：實際的「至少選擇一個」驗證會在表單提交時動態檢查，因為偏好類型是動態載入的
 */
export const createPreferencesFormSchema = (t?: TFunction) => {
  const msg = (key: string) => {
    if (t) return t(key as Parameters<TFunction>[0]);
    return key;
  };

  return z
    .object({
      preferences: z.record(
        z.string(), // preferenceTypeId (string key)
        z.array(z.number()) // optionIds
      ),
    })
    .refine(
      (data) => {
        // 檢查每個偏好類別是否至少選擇一個選項
        const entries = Object.entries(data.preferences);
        return entries.every(([, optionIds]) => optionIds.length > 0);
      },
      {
        message: msg("validation_preference_required"),
        path: ["preferences"],
      }
    );
};

export const preferencesFormSchema = createPreferencesFormSchema();

export type PreferencesFormValues = z.infer<typeof preferencesFormSchema>;
