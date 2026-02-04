"use client";

import { type CreatePracticeRequestType, createPractice } from "@daodao/api";
import { ArrowLeftOutlineSvg, ArrowRightOutlineSvg } from "@daodao/assets";
import { useRouter } from "@daodao/i18n/navigation";
import { StorageEnum, useFormDraft } from "@daodao/shared";
import { Button } from "@daodao/ui/components/button";
import { Form } from "@daodao/ui/components/form";
import { Progress } from "@daodao/ui/components/progress";
import { toast } from "@daodao/ui/components/sonner";
import { useNavigationBlockerEffect } from "@daodao/ui/hooks/navigation-blocker";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { BackgroundAnimation, PageHeader } from "@/components/layout";
import { type ManualPracticeFormValues, manualPracticeFormSchema } from "@/components/practice";
import { Step1 } from "@/components/practice/create/manual/steps/step-1";
import { Step2 } from "@/components/practice/create/manual/steps/step-2";
import { Step3 } from "@/components/practice/create/manual/steps/step-3";
import { Step4 } from "@/components/practice/create/manual/steps/step-4";
import { Step5 } from "@/components/practice/create/manual/steps/step-5";
import {
  type ExecutionTiming,
  type Frequency,
  mapExecutionTimingToPracticeTimePeriods,
  parseFrequency,
} from "@/constants/practice-form";
import { useRestoreDraftDialog } from "@/hooks/use-restore-draft-dialog";

const TOTAL_STEPS = 5;

const defaultFormValues: Partial<ManualPracticeFormValues> = {
  name: "",
  actionDescription: "",
  durationMinutes: 30,
  startDate: "",
  executionTiming: [],
  customTiming: "",
  tags: [],
  resources: [],
};

// 將表單資料轉換成 API 請求格式
const convertFormValuesToApiRequest = (
  values: ManualPracticeFormValues
): CreatePracticeRequestType => {
  const frequency = parseFrequency(values.frequency as Frequency);
  const practiceTimePeriods = mapExecutionTimingToPracticeTimePeriods(
    values.executionTiming as ExecutionTiming[]
  );

  const request: Record<string, unknown> = {
    title: values.name,
    durationDays: parseInt(values.durationDays, 10),
    frequencyMinDays: frequency.minDays,
    frequencyMaxDays: frequency.maxDays,
    sessionDurationMinutes: values.durationMinutes,
  };

  if (values.actionDescription) {
    request.practiceAction = values.actionDescription;
  }

  if (values.startDate) {
    request.startDate = values.startDate;
  }

  if (practiceTimePeriods.length > 0) {
    request.practiceTimePeriods = practiceTimePeriods;
  }

  if (values.tags && values.tags.length > 0) {
    request.tags = values.tags;
  }

  if (values.resources && values.resources.length > 0) {
    request.resources = values.resources.map((resource) => ({
      name: resource.name,
      url: resource.url || undefined,
    }));
  }

  if (values.customTiming) {
    request.otherContext = values.customTiming;
  }

  return request as CreatePracticeRequestType;
};

export default function CreateManualPracticePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRestoreDialogOpenRef = useRef(false);

  const form = useForm<ManualPracticeFormValues>({
    resolver: zodResolver(manualPracticeFormSchema),
    defaultValues: defaultFormValues as ManualPracticeFormValues,
    mode: "onSubmit",
  });

  // 使用共用 Hook 處理暫存邏輯
  const { draft, showRestoreDialog, isCheckingDraft, restoreDraft, clearDraft } =
    useFormDraft<ManualPracticeFormValues>({
      storageKey: StorageEnum.ManualPracticeDraft,
      form,
      currentStep,
    });

  // 處理恢復暫存資料（包含恢復步驟）
  const handleRestoreDraft = useCallback(() => {
    restoreDraft();

    // 恢復當前步驟
    if (draft?.currentStep && draft.currentStep >= 1 && draft.currentStep <= TOTAL_STEPS) {
      setCurrentStep(draft.currentStep);
    }
  }, [draft, restoreDraft]);

  const name = form.watch("name");
  const actionDescription = form.watch("actionDescription");

  const handleNext = async () => {
    let isValid = false;

    switch (currentStep) {
      case 1:
        isValid = await form.trigger(["name", "actionDescription"]);
        break;
      case 2:
        isValid = await form.trigger(["startDate", "durationDays", "frequency"]);
        break;
      case 3:
        isValid = await form.trigger(["durationMinutes", "executionTiming", "customTiming"]);
        break;
      case 4:
        isValid = await form.trigger(["tags", "resources"]);
        break;
      case 5:
        // 預覽步驟不需要驗證，直接提交
        isValid = true;
        break;
    }

    if (isValid && currentStep < TOTAL_STEPS) {
      window.scrollTo(0, 0);
      setCurrentStep(currentStep + 1);
    } else if (isValid && currentStep === TOTAL_STEPS) {
      // 在預覽步驟點擊下一步時提交表單
      await form.handleSubmit(handleSubmit)();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (values: ManualPracticeFormValues) => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const apiRequest = convertFormValuesToApiRequest(values);

      const response = await createPractice(apiRequest);

      if (response.error) {
        // response.error 是整個響應物件，實際錯誤在 response.error.error
        const errorResponse = response.error as {
          error?: {
            message?: string;
            details?: Array<{ path?: string; message?: string }>;
          };
          message?: string;
        };

        const error = errorResponse.error || errorResponse;
        let errorMessage = "建立實踐失敗";
        let shouldNavigateToStep: number | null = null;

        // 處理錯誤訊息
        if (typeof error === "object" && error !== null) {
          // 檢查是否有 details 陣列
          if ("details" in error && Array.isArray(error.details)) {
            // 處理 details 陣列中的每個錯誤
            const details = error.details;

            details.forEach((detail) => {
              if (detail.path && detail.message) {
                // 將錯誤設置到對應的表單欄位
                form.setError(detail.path as keyof ManualPracticeFormValues, {
                  type: "server",
                  message: detail.message,
                });

                // 根據欄位名稱決定要跳轉到哪個步驟
                if (detail.path === "tags" || detail.path === "resources") {
                  shouldNavigateToStep = 4;
                } else if (
                  detail.path === "durationMinutes" ||
                  detail.path === "executionTiming" ||
                  detail.path === "customTiming"
                ) {
                  shouldNavigateToStep = 3;
                } else if (
                  detail.path === "startDate" ||
                  detail.path === "durationDays" ||
                  detail.path === "frequency"
                ) {
                  shouldNavigateToStep = 2;
                } else if (detail.path === "name" || detail.path === "actionDescription") {
                  shouldNavigateToStep = 1;
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

        console.error("Failed to create practice:", response.error);
        toast.error(errorMessage);

        // 如果有需要跳轉的步驟，跳轉到該步驟
        if (shouldNavigateToStep !== null) {
          setCurrentStep(shouldNavigateToStep);
          window.scrollTo(0, 0);
        }

        setIsSubmitting(false);
        return;
      }

      // 提交成功後清除暫存資料
      clearDraft();

      // 取得新建立的實踐 ID
      const practiceId = response.data?.data?.id;

      // 提交後導航到成功頁面
      if (practiceId) {
        router.push(
          `/practices/create/success?practiceName=${encodeURIComponent(values.name || "")}&practiceId=${encodeURIComponent(practiceId)}`
        );
      } else {
        router.push(
          `/practices/create/success?practiceName=${encodeURIComponent(values.name || "")}`
        );
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "建立實踐失敗，請稍後再試";
      console.error("Failed to create practice:", error);
      toast.error(errorMessage);
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (currentStep === TOTAL_STEPS) {
      await form.handleSubmit(handleSubmit)();
    }
  };

  const { openRestoreDialog } = useRestoreDraftDialog({ draft });

  useEffect(() => {
    if (showRestoreDialog && !isRestoreDialogOpenRef.current) {
      const handleRestore = async () => {
        isRestoreDialogOpenRef.current = true;
        try {
          const result = await openRestoreDialog();
          if (result.value === "restore") {
            handleRestoreDraft();
          } else if (result.value === "discard") {
            clearDraft();
          }
        } finally {
          isRestoreDialogOpenRef.current = false;
        }
      };
      handleRestore();
    }
  }, [showRestoreDialog, openRestoreDialog, handleRestoreDraft, clearDraft]);

  useNavigationBlockerEffect(form.formState.isDirty);

  return (
    <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto bg-white">
      <BackgroundAnimation />

      <PageHeader title={currentStep === 5 ? "預覽" : "建立實踐"} rightActionTo="/" />

      <main className="relative px-5 max-w-[448px] mx-auto pb-20">
        {/* Progress Bar */}
        {currentStep !== 5 && (
          <div className="mb-12">
            <div className="text-xs text-text-dark">
              {currentStep} / {TOTAL_STEPS}
            </div>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: TOTAL_STEPS }, (_, index) => index + 1).map((step) => (
                <Progress
                  key={step}
                  value={currentStep >= step ? 100 : 0}
                  className="h-1 [--active-color:var(--logo-cyan)] bg-bg-gray"
                />
              ))}
            </div>
          </div>
        )}

        {/* 檢查暫存資料時的遮罩 */}
        {isCheckingDraft && <div className="fixed inset-0 z-40 bg-white/80 backdrop-blur-sm" />}

        {/* Form */}
        <Form {...form}>
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {currentStep >= 2 && currentStep <= 4 && (
              <div>
                <h1 className="text-xl font-semibold text-text-dark mb-1">{name}</h1>
                <p className="text-sm text-text-dark">{actionDescription}</p>
              </div>
            )}

            {currentStep === 1 && <Step1 form={form} />}
            {currentStep === 2 && <Step2 form={form} />}
            {currentStep === 3 && <Step3 form={form} />}
            {currentStep === 4 && <Step4 form={form} />}
            {currentStep === 5 && <Step5 form={form} />}

            {/* Navigation Buttons */}
            <footer className="fixed bottom-0 left-0 right-0 flex justify-center gap-6 p-6 border-t border-light-gray bg-very-light-gray">
              <Button
                type="button"
                variant="outline"
                onClick={currentStep === 1 ? () => router.back() : handlePrevious}
                className="w-full sm:max-w-[288px] group"
                disabled={isCheckingDraft}
              >
                <ArrowLeftOutlineSvg className="size-4.5 text-logo-cyan group-hover:text-white" />
                上一步
              </Button>

              <Button
                type="button"
                onClick={handleNext}
                className="w-full sm:max-w-[288px]"
                disabled={isCheckingDraft || isSubmitting}
              >
                下一步
                <ArrowRightOutlineSvg className="size-4.5" />
              </Button>
            </footer>
          </form>
        </Form>
      </main>
    </div>
  );
}
