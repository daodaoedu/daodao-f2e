"use client";

import type { PreferenceOption, PreferenceType, UpdatePreferencesRequest } from "@daodao/api";
import { useAvailablePreferences, useCurrentUserPreferences, useUserMutations } from "@daodao/api";
import { useRouter } from "@daodao/i18n/navigation";
import { Button } from "@daodao/ui/components/button";
import { Form } from "@daodao/ui/components/form";
import { toast } from "@daodao/ui/components/sonner";
import { useNavigationBlockerEffect } from "@daodao/ui/hooks/navigation-blocker";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { mutate } from "swr";
import { PreferenceSection } from "./preference-section";
import { type PreferencesFormValues, preferencesFormSchema } from "./schema";

export const PreferencesForm = () => {
  const router = useRouter();
  const {
    data: preferencesData,
    isLoading: isLoadingPreferences,
    error: preferencesError,
  } = useCurrentUserPreferences();
  const {
    data: availableData,
    isLoading: isLoadingAvailable,
    error: availableError,
  } = useAvailablePreferences();
  const { updateCurrentUserPreferences } = useUserMutations();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesFormSchema),
    defaultValues: {
      preferences: {},
    },
  });

  // 獲取可用的偏好類型列表
  const preferenceTypes = useMemo((): PreferenceType[] => {
    if (!availableData?.data) {
      return [];
    }
    return availableData.data as PreferenceType[];
  }, [availableData]);

  // 將 API 返回的偏好設定轉換為表單格式
  const formDefaultValues = useMemo(() => {
    const preferences: Record<string, number[]> = {};

    // 先為所有偏好類型初始化空陣列
    preferenceTypes.forEach((type) => {
      preferences[String(type.id)] = [];
    });

    // 如果有用戶偏好設定，填充已選擇的選項
    // API 返回的 preferences 陣列中每個元素包含 preferenceTypeId, optionId, isSelected
    if (preferencesData?.data?.preferences && Array.isArray(preferencesData.data.preferences)) {
      preferencesData.data.preferences.forEach((pref) => {
        // 簡單判斷：確保 pref 有必要的屬性
        if (
          pref &&
          typeof pref === "object" &&
          "preferenceTypeId" in pref &&
          typeof pref.preferenceTypeId === "number" &&
          "optionId" in pref &&
          typeof pref.optionId === "number" &&
          "isSelected" in pref &&
          pref.isSelected === true
        ) {
          const typeId = String(pref.preferenceTypeId);
          if (!preferences[typeId]) {
            preferences[typeId] = [];
          }
          preferences[typeId].push(pref.optionId);
        }
      });
    }

    return preferences;
  }, [preferencesData, preferenceTypes]);

  // 當偏好設定資料載入完成時，更新表單預設值
  useEffect(() => {
    if (preferenceTypes.length > 0) {
      form.reset({
        preferences: formDefaultValues,
      });
    }
  }, [formDefaultValues, preferenceTypes.length, form.reset]);

  const handleSubmit = async (values: PreferencesFormValues) => {
    console.log("Form submit triggered with values:", values);
    setIsSubmitting(true);

    try {
      // 將表單資料轉換為 API 格式
      // 需要為每個偏好類型的所有選項生成 PreferenceItem
      // 如果選項在 selectedOptionIds 中，isSelected = true，否則為 false
      const preferenceItems: Array<{
        preferenceTypeId: number;
        optionId: number;
        isSelected: boolean;
      }> = [];

      preferenceTypes.forEach((preferenceType) => {
        const typeId = String(preferenceType.id);
        const selectedOptionIds = values.preferences[typeId] || [];

        preferenceType.options.forEach((option: PreferenceOption) => {
          preferenceItems.push({
            preferenceTypeId: preferenceType.id,
            optionId: option.id,
            isSelected: selectedOptionIds.includes(option.id),
          });
        });
      });

      const requestData: UpdatePreferencesRequest = {
        preferences: preferenceItems,
      };
      const response = await updateCurrentUserPreferences(requestData);

      console.log("API response:", response);

      // 檢查錯誤
      if (response.error) {
        const error = response.error;
        let errorMessage = "更新失敗，請稍後再試";

        if (typeof error === "object" && error !== null) {
          // 檢查是否有 details（可能是陣列或物件）
          if ("details" in error) {
            const details = error.details;

            // 處理 details 為物件的情況（例如：{ "data.preferences": "Invalid input: ..." }）
            if (typeof details === "object" && details !== null && !Array.isArray(details)) {
              const detailEntries = Object.entries(details);
              const firstEntry = detailEntries[0];
              if (firstEntry && firstEntry.length >= 2) {
                // 使用第一個錯誤訊息
                const firstMessage = firstEntry[1];
                if (typeof firstMessage === "string") {
                  errorMessage = firstMessage;
                }
              }
            }
            // 處理 details 為陣列的情況
            else if (Array.isArray(details)) {
              const detailArray = details as Array<{ path?: string; message?: string }>;

              // 處理每個欄位錯誤
              detailArray.forEach((detail) => {
                if (detail.path && detail.message) {
                  // 將錯誤設置到對應的表單欄位
                  // 偏好設定的錯誤路徑可能是 "preferences[0].preferenceTypeId" 等
                  // 這裡我們簡化處理，將錯誤設置到對應的偏好類型
                  const match = detail.path.match(/preferences\[(\d+)\]/)?.[1];
                  if (match) {
                    const index = parseInt(match, 10);
                    const item = preferenceItems[index];
                    if (item) {
                      const typeId = String(item.preferenceTypeId);
                      form.setError(`preferences.${typeId}` as keyof PreferencesFormValues, {
                        type: "server",
                        message: detail.message,
                      });
                    }
                  }
                }
              });

              // 使用第一個具體錯誤訊息作為 toast 訊息
              const firstDetail = detailArray[0];
              if (firstDetail?.message) {
                errorMessage = firstDetail.message;
              }
            }
          }

          // 如果沒有 details 或處理後沒有錯誤訊息，使用頂層 message
          if (errorMessage === "更新失敗，請稍後再試" && "message" in error && error.message) {
            errorMessage = String(error.message);
          }
        }

        console.error("Failed to update preferences:", response.error);
        toast.error(errorMessage);
        setIsSubmitting(false);
        return;
      }

      // 成功
      toast.success("偏好設定已更新");
      form.reset(form.getValues()); // 重置 dirty 狀態
      mutate("/api/v1/users/settings-summary");

      // 延遲後返回設定首頁，讓使用者看到成功訊息
      setTimeout(() => {
        router.push("/settings");
      }, 500);
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("更新失敗，請稍後再試");
    } finally {
      setIsSubmitting(false);
    }
  };

  useNavigationBlockerEffect(form.formState.isDirty);

  // 載入中狀態
  if (isLoadingPreferences || isLoadingAvailable) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-text-dark">載入中...</p>
      </div>
    );
  }

  // 錯誤狀態
  if (preferencesError || availableError) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-red">載入偏好設定失敗，請稍後再試</p>
      </div>
    );
  }

  // 如果沒有可用的偏好類型，顯示提示
  if (preferenceTypes.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-text-dark">目前沒有可用的偏好設定</p>
      </div>
    );
  }

  const onSubmit = (values: PreferencesFormValues) => {
    handleSubmit(values);
  };

  const onError = (errors: unknown) => {
    console.error("Form validation errors:", errors);
    // 顯示表單驗證錯誤
    // React Hook Form 的錯誤格式可能是嵌套的
    const formErrors = errors as Record<
      string,
      { _errors?: string[]; message?: string } | undefined
    >;

    // 檢查頂層錯誤
    if (formErrors.preferences) {
      const prefErrors = formErrors.preferences;
      if (prefErrors._errors && prefErrors._errors.length > 0) {
        toast.error(prefErrors._errors[0]);
        return;
      }
      if (prefErrors.message) {
        toast.error(prefErrors.message);
        return;
      }
    }

    // 檢查其他欄位錯誤
    const errorMessages: string[] = [];
    const extractErrors = (obj: unknown, path = ""): void => {
      if (typeof obj === "object" && obj !== null) {
        Object.entries(obj).forEach(([key, value]) => {
          if (key === "_errors" && Array.isArray(value)) {
            errorMessages.push(...value);
          } else if (key === "message" && typeof value === "string") {
            errorMessages.push(value);
          } else if (typeof value === "object") {
            extractErrors(value, path ? `${path}.${key}` : key);
          }
        });
      }
    };

    extractErrors(formErrors);

    if (errorMessages.length > 0) {
      toast.error(errorMessages[0]);
    } else {
      toast.error("請檢查表單欄位");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-6">
        {preferenceTypes.map((preferenceType) => (
          <PreferenceSection
            key={preferenceType.id}
            form={form}
            preferenceTypeId={String(preferenceType.id)}
            preferenceTypeName={preferenceType.name}
            preferenceTypeDescription={preferenceType.description}
            availableOptions={preferenceType.options}
            maxSelection={preferenceType.maxSelections}
          />
        ))}

        {/* 儲存按鈕 */}
        <footer className="fixed bottom-20 left-0 right-0 z-20 flex justify-center gap-6 border-t border-light-gray bg-very-light-gray p-6 md:bottom-0">
          <Button
            type="submit"
            variant="orange"
            className="w-full sm:max-w-[288px]"
            disabled={isSubmitting}
          >
            {isSubmitting ? "儲存中..." : "儲存"}
          </Button>
        </footer>
      </form>
    </Form>
  );
};
