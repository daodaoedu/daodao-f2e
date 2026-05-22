"use client";

import { type UpdateUserRequest, useCurrentUser, useUserMutations } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { useRouter } from "@daodao/i18n/navigation";
import { Button } from "@daodao/ui/components/button";
import { Form } from "@daodao/ui/components/form";
import { toast } from "@daodao/ui/components/sonner";
import { useNavigationBlockerEffect } from "@daodao/ui/hooks/navigation-blocker";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parse } from "date-fns";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { mutate } from "swr";
import {
  applyOnboardingUpdateFromResponse,
  refreshOnboardingStatus,
} from "@/components/task-guide/onboarding-progress-context";
import { FieldSelectionSection } from "./field-selection-section";
import { PersonalInfoSection } from "./personal-info-section";
import {
  type AccountFormValues,
  AVAILABLE_FIELDS,
  accountFormSchema,
  EDUCATION_STAGE_OPTIONS,
  INTEREST_CATEGORIES,
  POSITION_OPTIONS,
} from "./schema";

export const AccountForm = () => {
  const t = useTranslations("account_settings");
  const router = useRouter();
  const { data: userData, isLoading, error: userError } = useCurrentUser();
  const { updateCurrentUser } = useUserMutations();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      email: "",
      birthday: undefined,
      position: [],
      educationStage: "",
      professionalFields: [],
      explorationFields: [],
    },
  });

  // 當用戶資料載入完成時，更新表單預設值
  useEffect(() => {
    if (userData?.data) {
      const user = userData.data;

      form.reset({
        email: user.email || "",
        birthday: user.birthDay ? parse(user.birthDay, "yyyy-MM-dd", new Date()) : undefined,
        position: user.positionList || [],
        educationStage: user.educationStage || "",
        professionalFields: user.professionalField || [],
        explorationFields: user.interestList || [],
      });
    }
  }, [userData, form.reset]);

  const handleSubmit = async (values: AccountFormValues) => {
    setIsSubmitting(true);

    try {
      // 準備 API 請求資料
      const updateData: {
        birthDay?: string;
        positionList?: string[];
        educationStage?: string;
        professionalField?: string[];
        interestList?: string[];
      } = {};

      // 轉換生日
      if (values.birthday) {
        updateData.birthDay = format(values.birthday, "yyyy-MM-dd");
      }

      // 身份（直接對應資料庫值，允許多選）
      updateData.positionList = values.position;

      // 教育階段（直接對應資料庫值）
      if (values.educationStage) {
        updateData.educationStage = values.educationStage;
      }

      // 轉換專業領域和探索領域（總是包含，允許清空）
      updateData.professionalField = values.professionalFields;
      updateData.interestList = values.explorationFields;

      // 調用 API
      const response = await updateCurrentUser(updateData as UpdateUserRequest);

      // 檢查錯誤
      if (response.error) {
        const error = response.error;
        let errorMessage = t("save_error");

        if (typeof error === "object" && error !== null) {
          // 檢查是否有 details 陣列
          if ("details" in error && Array.isArray(error.details)) {
            const details = error.details as Array<{ path?: string; message?: string }>;

            // 處理每個欄位錯誤
            details.forEach((detail) => {
              if (detail.path && detail.message) {
                // 將錯誤設置到對應的表單欄位
                const formFieldMap: Record<string, keyof AccountFormValues> = {
                  birthDay: "birthday",
                  positionList: "position",
                  educationStage: "educationStage",
                  professionalField: "professionalFields",
                  interestList: "explorationFields",
                };

                const formField = formFieldMap[detail.path];
                if (formField) {
                  form.setError(formField, {
                    type: "server",
                    message: detail.message,
                  });
                }
              }
            });

            // 使用第一個具體錯誤訊息作為 toast 訊息
            const firstDetail = details[0];
            if (firstDetail?.message) {
              errorMessage = firstDetail.message;
            }
          } else if ("message" in error && error.message) {
            // 如果沒有 details，使用頂層 message
            errorMessage = String(error.message);
          }
        }

        console.error("Failed to update user:", response.error);
        toast.error(errorMessage);
        setIsSubmitting(false);
        return;
      }

      // 成功
      toast.success(t("save_success"));
      form.reset(form.getValues()); // 重置 dirty 狀態
      mutate("/api/v1/users/settings-summary");
      if (!applyOnboardingUpdateFromResponse(response.data)) {
        refreshOnboardingStatus();
      }

      // 延遲後返回設定首頁，讓使用者看到成功訊息
      setTimeout(() => {
        router.push("/settings");
      }, 500);
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error(t("save_error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  useNavigationBlockerEffect(form.formState.isDirty);

  // 載入中狀態
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-text-dark">{t("loading")}</p>
      </div>
    );
  }

  // 錯誤狀態
  if (userError) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-red">{t("load_error")}</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <PersonalInfoSection form={form} educationStageOptions={EDUCATION_STAGE_OPTIONS} />

        <FieldSelectionSection
          form={form}
          fieldName="position"
          label={t("role_label")}
          availableFields={POSITION_OPTIONS}
          maxSelection={5}
        />

        <FieldSelectionSection
          form={form}
          fieldName="professionalFields"
          label={t("professional_field_label")}
          availableFields={AVAILABLE_FIELDS}
          maxSelection={5}
        />

        <FieldSelectionSection
          form={form}
          fieldName="explorationFields"
          label={t("exploration_field_label")}
          availableFields={INTEREST_CATEGORIES}
          maxSelection={5}
        />

        {/* 儲存按鈕 */}
        <footer className="fixed bottom-20 left-0 right-0 z-20 flex justify-center gap-6 border-t border-light-gray bg-very-light-gray p-6 md:bottom-0">
          <Button
            type="submit"
            variant="orange"
            className="w-full sm:max-w-[288px]"
            disabled={isSubmitting}
          >
            {isSubmitting ? t("saving") : t("save")}
          </Button>
        </footer>
      </form>
    </Form>
  );
};
