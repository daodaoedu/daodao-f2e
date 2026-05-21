"use client";

import { checkCustomIdAvailability, saveQuizResult, useUserMutations } from "@daodao/api";
import { useAuth } from "@daodao/auth";
import { useTranslations } from "@daodao/i18n";
import { getStorage, StorageEnum } from "@daodao/shared";
import { Button } from "@daodao/ui/components/button";
import { Form } from "@daodao/ui/components/form";
import { toast } from "@daodao/ui/components/sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { refreshOnboardingStatus } from "@/components/task-guide/onboarding-progress-context";
import { buildQuizSaveRequest } from "@/utils/save-pending-quiz";
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
  const {
    currentStep,
    nextStep,
    prevStep,
    totalSteps,
    isFirstStep,
    isLastInputStep,
    isSuccessStep,
  } = useOnboardingStep();

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

  const validateCustomIdAvailability = async (customId: string): Promise<boolean> => {
    const response = await checkCustomIdAvailability(customId.trim());

    if (response.error) {
      console.error("Failed to check customId availability:", response.error);
      toast.error(t("errors.submitFailed"));
      return false;
    }

    if (!response.data?.data?.available) {
      form.setError("customId", {
        type: "server",
        message: t("steps.profile.usernameUnavailable"),
      });
      return false;
    }

    return true;
  };

  /**
   * 驗證當前步驟的欄位
   */
  const validateCurrentStep = async (): Promise<boolean> => {
    const values = form.getValues();

    try {
      switch (currentStep) {
        case 1:
          // Profile 步驟：確認必填欄位與 customId 可用性
          await profileStepSchema.parseAsync({
            email: values.email,
            birthDate: values.birthDate,
            name: values.name,
            customId: values.customId,
            personalSlogan: values.personalSlogan,
          });
          return validateCustomIdAvailability(values.customId);

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
      // 組裝 API 請求資料（所有欄位都是必填）
      const updateData: Parameters<typeof updateCurrentUserWithFormData>[0] = {
        birthDay: format(values.birthDate, "yyyy-MM-dd"),
        name: values.name.trim(),
        customId: values.customId.trim(),
        personalSlogan: values.personalSlogan.trim(),
        professionalField: values.professionalFields,
        interestList: values.interests,
        referralSource: values.referralSource,
      };

      // 臨時用戶使用 POST 創建，正常用戶使用 PUT 更新
      if (isTemporary) {
        await createCurrentUserWithFormData(updateData);
        // 臨時用戶完成 onboarding 後，後端會發新的 token
        // 需要先刷新 token 再檢查認證狀態
        await refreshToken();

        // 若用戶從測驗流程來，儲存 sessionStorage 中待存的測驗結果。
        // 在 refreshAuth() 之前呼叫，確保後端在 onboarding status 首次 fetch 前已有資料。
        const pendingQuiz = getStorage(StorageEnum.Quiz).get();
        const quizPayload = buildQuizSaveRequest(pendingQuiz);
        if (quizPayload) {
          try {
            await saveQuizResult(quizPayload);
            getStorage(StorageEnum.Quiz).remove();
            refreshOnboardingStatus();
          } catch (quizError) {
            // Non-fatal: task A stays unchecked until user revisits the quiz page.
            console.error("Failed to save pending quiz result after registration:", quizError);
          }
        }
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

    // 從 API 路徑中提取欄位名稱（例如 "/birthDay" -> "birthDay"）
    const pathParts = apiPath.split("/").filter(Boolean);
    const fieldName = pathParts[pathParts.length - 1];

    // 使用完全相等比對，避免子字串誤判
    if (!fieldName) return null;
    return mapping[fieldName] ?? null;
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
                <Button type="button" variant="ghost" className="flex-1" onClick={prevStep}>
                  {t("navigation.previous")}
                </Button>
              )}
              {!isLastInputStep ? (
                <Button type="button" variant="orange" className="flex-1" onClick={handleNext}>
                  {t("navigation.next")}
                </Button>
              ) : (
                <Button type="submit" variant="orange" className="flex-1" disabled={isSubmitting}>
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
