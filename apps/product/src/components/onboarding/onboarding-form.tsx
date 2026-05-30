"use client";

import { checkCustomIdAvailability, submitOnboardingFlowResponse, useUserMutations } from "@daodao/api";
import { useAuth } from "@daodao/auth";
import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { Form } from "@daodao/ui/components/form";
import { toast } from "@daodao/ui/components/sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { DynamicStep } from "./dynamic-step";
import { InterestsSection } from "./interests-section";
import { OnboardingStepper } from "./onboarding-stepper";
import { ProfileSection } from "./profile-section";
import { ReferralSection } from "./referral-section";
import {
  createOnboardingFormSchema,
  createOnboardingStepSchemas,
  type OnboardingFormValues,
} from "./schema";
import { SuccessSection } from "./success-section";
import { useActiveFlow } from "./use-active-flow";
import { useOnboardingStep } from "./use-onboarding-step";

interface OnboardingFormProps {
  initialEmail?: string;
}

export const OnboardingForm = ({ initialEmail }: OnboardingFormProps) => {
  const t = useTranslations("onboarding");
  const schemas = useMemo(() => createOnboardingStepSchemas(t), [t]);
  const { isTemporary, refreshAuth, refreshToken } = useAuth();
  const { updateCurrentUserWithFormData, createCurrentUserWithFormData } = useUserMutations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dynamicStepError, setDynamicStepError] = useState<string | null>(null);

  // 動態流程：若有啟用的流程，以其步驟取代固定的興趣 + 來源步驟
  const { data: activeFlow } = useActiveFlow();
  const flowSteps = activeFlow?.steps ?? null;

  // totalSteps = 1 (profile) + N (動態 or 2 固定) + 1 (success)
  const dynamicStepCount = flowSteps?.length ?? 2;
  const totalSteps = 1 + dynamicStepCount + 1;

  const {
    currentStep,
    nextStep,
    prevStep,
    isFirstStep,
    isLastInputStep,
    isSuccessStep,
  } = useOnboardingStep(totalSteps);

  // 當前動態步驟（step 2 → index 0, step 3 → index 1, ...）
  const dynamicStepIndex = currentStep - 2;
  const currentDynamicStep = flowSteps?.[dynamicStepIndex] ?? null;

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(createOnboardingFormSchema(t)),
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
      dynamicAnswers: {},
    },
    mode: "onChange",
  });

  const validateCustomIdAvailability = async (customId: string): Promise<boolean> => {
    const response = await checkCustomIdAvailability(customId.trim());
    if (response.error) {
      toast.error(t("errors.submitFailed"));
      return false;
    }
    if (!response.data?.data?.available) {
      form.setError("customId", { type: "server", message: t("steps.profile.usernameUnavailable") });
      return false;
    }
    return true;
  };

  const validateCurrentStep = async (): Promise<boolean> => {
    const values = form.getValues();

    try {
      if (currentStep === 1) {
        await schemas.profileStepSchema.parseAsync({
          email: values.email,
          birthDate: values.birthDate,
          name: values.name,
          customId: values.customId,
          personalSlogan: values.personalSlogan,
        });
        return validateCustomIdAvailability(values.customId);
      }

      // 動態流程步驟驗證
      if (flowSteps && currentDynamicStep) {
        const answers = (values.dynamicAnswers ?? {})[currentDynamicStep.id.toString()] ?? [];
        if (currentDynamicStep.questionType !== "text" && answers.length === 0) {
          setDynamicStepError("請選擇至少一個選項");
          return false;
        }
        if (currentDynamicStep.questionType === "text" && !answers[0]?.trim()) {
          setDynamicStepError("請輸入你的回答");
          return false;
        }
        setDynamicStepError(null);
        return true;
      }

      // 固定流程步驟驗證（fallback）
      if (currentStep === 2) {
        await schemas.interestsStepSchema.parseAsync({
          professionalFields: values.professionalFields,
          interests: values.interests,
        });
        return true;
      }
      if (currentStep === 3) {
        await schemas.referralStepSchema.parseAsync({
          referralSource: values.referralSource,
          otherReferralText: values.otherReferralText,
        });
        return true;
      }

      return true;
    } catch {
      await form.trigger();
      return false;
    }
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) nextStep();
  };

  const handleSubmit = async (values: OnboardingFormValues) => {
    setIsSubmitting(true);

    try {
      const dynamicAnswerMap = values.dynamicAnswers ?? {};

      // 預設使用固定流程欄位；動態流程透過 fieldKey 覆蓋
      let interestList: string[] = values.interests ?? [];
      let professionalField: string[] = values.professionalFields ?? [];
      let referralSource = values.referralSource ?? "";

      if (flowSteps) {
        for (const step of flowSteps) {
          const answers = dynamicAnswerMap[step.id.toString()] ?? [];
          if (step.fieldKey === "interests") interestList = answers;
          else if (step.fieldKey === "professional_fields") professionalField = answers;
          else if (step.fieldKey === "referral") referralSource = answers[0] ?? "";
        }
      }

      const updateData: Parameters<typeof updateCurrentUserWithFormData>[0] = {
        birthDay: format(values.birthDate, "yyyy-MM-dd"),
        name: values.name.trim(),
        customId: values.customId.trim(),
        personalSlogan: values.personalSlogan.trim(),
        professionalField,
        interestList,
        referralSource,
      };

      if (isTemporary) {
        const storedFlow = localStorage.getItem('daodao_registration_flow');
        const registrationFlow = (storedFlow === 'quiz' || storedFlow === 'action_maker')
          ? storedFlow
          : 'landing_page';
        await createCurrentUserWithFormData({ ...updateData, registrationFlow });
        localStorage.removeItem('daodao_registration_flow');
        await refreshToken();
      } else {
        await updateCurrentUserWithFormData(updateData);
      }

      await refreshAuth();

      // 記錄動態流程回答（非阻塞，失敗不影響用戶）
      if (activeFlow && flowSteps) {
        await Promise.allSettled(
          flowSteps
            .filter((step) => (dynamicAnswerMap[step.id.toString()] ?? []).length > 0)
            .map((step) =>
              submitOnboardingFlowResponse(
                activeFlow.id,
                step.id,
                dynamicAnswerMap[step.id.toString()] ?? []
              )
            )
        );
      }

      nextStep();
    } catch (error) {
      console.error("Failed to submit onboarding:", error);

      if (error instanceof Error) {
        const apiError = error as Error & { details?: Array<{ path?: string; message?: string }> };
        if (apiError.details && Array.isArray(apiError.details)) {
          apiError.details.forEach((detail) => {
            if (detail.path && detail.message) {
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
    const pathParts = apiPath.split("/").filter(Boolean);
    const fieldName = pathParts[pathParts.length - 1];
    if (!fieldName) return null;
    return mapping[fieldName] ?? null;
  };

  const showDynamicStep = !isFirstStep && !isSuccessStep && flowSteps && currentDynamicStep;
  const showInterestsStep = !isFirstStep && !isSuccessStep && !flowSteps && currentStep === 2;
  const showReferralStep = !isFirstStep && !isSuccessStep && !flowSteps && currentStep === 3;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <OnboardingStepper currentStep={currentStep} totalSteps={totalSteps} />

        {currentStep === 1 && <ProfileSection form={form} />}
        {showDynamicStep && (
          <DynamicStep step={currentDynamicStep} form={form} error={dynamicStepError} />
        )}
        {showInterestsStep && <InterestsSection form={form} />}
        {showReferralStep && <ReferralSection form={form} />}
        {isSuccessStep && <SuccessSection userName={form.getValues("name") || undefined} />}

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
