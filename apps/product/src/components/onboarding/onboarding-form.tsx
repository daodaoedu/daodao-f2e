"use client";

import { useUserMutations } from "@daodao/api";
import { useAuth } from "@daodao/auth";
import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { Form } from "@daodao/ui/components/form";
import { toast } from "@daodao/ui/components/sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { InterestsSection } from "./interests-section";
import { OnboardingStepper } from "./onboarding-stepper";
import { ProfileSection } from "./profile-section";
import { ReferralSection } from "./referral-section";
import {
  interestsStepSchema,
  type OnboardingFormValues,
  onboardingFormSchema,
  profileStepSchema,
  referralStepSchema,
} from "./schema";
import { SuccessSection } from "./success-section";
import { useOnboardingStep } from "./use-onboarding-step";

interface OnboardingFormProps {
  /** 用戶的 email，從 OAuth 取得 */
  initialEmail?: string;
}

/**
 * Onboarding 主表單元件
 * 管理整個 onboarding 流程，包含步驟導航和資料提交
 */
export const OnboardingForm = ({ initialEmail }: OnboardingFormProps) => {
  const t = useTranslations("onboarding");
  const { isTemporary, refreshAuth, refreshToken } = useAuth();
  const { updateCurrentUserWithFormData, createCurrentUserWithFormData } = useUserMutations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentStep, nextStep, prevStep, totalSteps, isFirstStep, isLastInputStep, isSuccessStep } =
    useOnboardingStep();

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingFormSchema),
    defaultValues: {
      email: initialEmail || "",
      birthDate: undefined,
      name: "",
      customId: "",
      personalSlogan: "",
      professionalFields: [],
      interests: [],
      referralSource: "",
      otherReferralText: "",
    },
    mode: "onChange",
  });

  /**
   * 驗證當前步驟的欄位
   */
  const validateCurrentStep = async (): Promise<boolean> => {
    const values = form.getValues();

    try {
      switch (currentStep) {
        case 1:
          // Profile 步驟：所有欄位都是選填的，但如果有填寫則需驗證格式
          await profileStepSchema.parseAsync({
            email: values.email,
            birthDate: values.birthDate,
            name: values.name,
            customId: values.customId,
            personalSlogan: values.personalSlogan,
          });
          return true;

        case 2:
          // Interests 步驟：interests 是必填
          await interestsStepSchema.parseAsync({
            professionalFields: values.professionalFields,
            interests: values.interests,
          });
          return true;

        case 3:
          // Referral 步驟：referralSource 是必填
          await referralStepSchema.parseAsync({
            referralSource: values.referralSource,
            otherReferralText: values.otherReferralText,
          });
          return true;

        default:
          return true;
      }
    } catch {
      // 觸發表單驗證以顯示錯誤訊息
      await form.trigger();
      return false;
    }
  };

  /**
   * 處理「下一步」按鈕
   */
  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      nextStep();
    }
  };

  /**
   * 處理表單提交
   */
  const handleSubmit = async (values: OnboardingFormValues) => {
    setIsSubmitting(true);

    try {
      // 組裝 API 請求資料
      const updateData: Parameters<typeof updateCurrentUserWithFormData>[0] = {
        referralSource: values.referralSource,
        interestList: values.interests,
      };

      // 選填欄位只有在有值時才加入
      if (values.birthDate) {
        updateData.birthDay = format(values.birthDate, "yyyy-MM-dd");
      }
      if (values.name) {
        updateData.name = values.name;
      }
      if (values.customId) {
        updateData.customId = values.customId;
      }
      if (values.personalSlogan) {
        updateData.personalSlogan = values.personalSlogan;
      }
      if (values.professionalFields && values.professionalFields.length > 0) {
        updateData.professionalField = values.professionalFields;
      }

      // 臨時用戶使用 POST 創建，正常用戶使用 PUT 更新
      if (isTemporary) {
        await createCurrentUserWithFormData(updateData);
        // 臨時用戶完成 onboarding 後，後端會發新的 token
        // 需要先刷新 token 再檢查認證狀態
        await refreshToken();
      } else {
        await updateCurrentUserWithFormData(updateData);
      }

      // 重新檢查認證狀態，更新 isTemporary 為 false
      await refreshAuth();

      // 成功後前往成功頁面
      nextStep();
    } catch (error) {
      console.error("Failed to submit onboarding:", error);

      // 處理伺服器驗證錯誤
      if (error instanceof Error) {
        const apiError = error as Error & {
          details?: Array<{ path?: string; message?: string }>;
        };

        if (apiError.details && Array.isArray(apiError.details)) {
          apiError.details.forEach((detail) => {
            if (detail.path && detail.message) {
              // 嘗試將 API 錯誤路徑映射到表單欄位
              const fieldName = mapApiPathToFormField(detail.path);
              if (fieldName) {
                form.setError(fieldName as keyof OnboardingFormValues, {
                  type: "server",
                  message: detail.message,
                });
              }
            }
          });
        }

        toast.error(error.message || t("errors.submitFailed"));
      } else {
        toast.error(t("errors.submitFailed"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 將 API 錯誤路徑映射到表單欄位名稱
   */
  const mapApiPathToFormField = (apiPath: string): string | null => {
    const mapping: Record<string, string> = {
      birthDay: "birthDate",
      customId: "customId",
      name: "name",
      personalSlogan: "personalSlogan",
      professionalField: "professionalFields",
      interestList: "interests",
      referralSource: "referralSource",
    };

    for (const [apiField, formField] of Object.entries(mapping)) {
      if (apiPath.includes(apiField)) {
        return formField;
      }
    }

    return null;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* 步驟指示器 */}
        <OnboardingStepper currentStep={currentStep} totalSteps={totalSteps} />

        {/* 步驟內容 */}
        {currentStep === 1 && <ProfileSection form={form} />}
        {currentStep === 2 && <InterestsSection form={form} />}
        {currentStep === 3 && <ReferralSection form={form} />}
        {currentStep === 4 && <SuccessSection userName={form.getValues("name") || undefined} />}

        {/* 導航按鈕（成功頁面不顯示） */}
        {!isSuccessStep && (
          <footer className="fixed bottom-0 left-0 right-0 flex justify-center gap-4 p-6 border-t border-light-gray bg-very-light-gray">
            <div className="w-full max-w-[448px] flex gap-4">
              {!isFirstStep && (
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1"
                  onClick={prevStep}
                >
                  {t("navigation.previous")}
                </Button>
              )}
              {!isLastInputStep ? (
                <Button
                  type="button"
                  variant="orange"
                  className="flex-1"
                  onClick={handleNext}
                >
                  {t("navigation.next")}
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="orange"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t("navigation.submitting") : t("navigation.complete")}
                </Button>
              )}
            </div>
          </footer>
        )}
      </form>
    </Form>
  );
};
