"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "@daodao/i18n/navigation";
import { Button } from "@daodao/ui/components/button";
import { Form } from "@daodao/ui/components/form";
import { Progress } from "@daodao/ui/components/progress";
import { BackgroundAnimation, PageHeader } from "@/components/layout";
import { Step1 } from "@/components/create-practice/manual/steps/step-1";
import { Step2 } from "@/components/create-practice/manual/steps/step-2";
import { Step3 } from "@/components/create-practice/manual/steps/step-3";
import { Step4 } from "@/components/create-practice/manual/steps/step-4";
import { Step5 } from "@/components/create-practice/manual/steps/step-5";
import {
  manualPracticeFormSchema,
  type ManualPracticeFormValues,
} from "@/components/create-practice/manual/schema";
import { ArrowLeftOutlineSvg, ArrowRightOutlineSvg } from "@daodao/assets";
import { useFormDraft, StorageEnum } from "@daodao/shared";
import { RestoreDraftDialog } from "@/components/create-practice";

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

export default function CreateManualPracticePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  const form = useForm<ManualPracticeFormValues>({
    resolver: zodResolver(manualPracticeFormSchema),
    defaultValues: defaultFormValues as ManualPracticeFormValues,
    mode: "onSubmit",
  });

  // 使用共用 Hook 處理暫存邏輯
  const {
    draft,
    showRestoreDialog,
    isCheckingDraft,
    restoreDraft,
    clearDraft,
  } = useFormDraft<ManualPracticeFormValues>({
    storageKey: StorageEnum.ManualPracticeDraft,
    form,
    currentStep,
  });

  // 處理恢復暫存資料（包含恢復步驟）
  const handleRestoreDraft = () => {
    restoreDraft();
    
    // 恢復當前步驟
    if (draft?.currentStep && draft.currentStep >= 1 && draft.currentStep <= TOTAL_STEPS) {
      setCurrentStep(draft.currentStep);
    }
  };

  const name = form.watch("name");
  const durationMinutes = form.watch("durationMinutes");

  const handleNext = async () => {
    let isValid = false;

    switch (currentStep) {
      case 1:
        isValid = await form.trigger([
          "name",
          "actionDescription",
          "durationMinutes",
        ]);
        break;
      case 2:
        isValid = await form.trigger([
          "startDate",
          "durationDays",
          "frequency",
        ]);
        break;
      case 3:
        isValid = await form.trigger(["executionTiming", "customTiming"]);
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
    // TODO: 提交表單資料到 API
    console.log("Form submitted:", values);
    // 提交成功後清除暫存資料
    clearDraft();
    // 提交後可以導航到成功頁面或返回
    router.push("/practices");
  };

  return (
    <div className="fixed inset-0 z-30 overflow-hidden overflow-y-auto bg-white">
      <BackgroundAnimation />

      {/* 恢復暫存確認對話框 */}
      <RestoreDraftDialog
        open={showRestoreDialog}
        draft={draft}
        title="恢復暫存資料"
        description="偵測到您有未完成的實踐建立資料，是否要恢復？"
        restoreButtonText="恢復資料"
        discardButtonText="重新開始"
        renderPreview={(draft) =>
          draft.formValues?.name ? (
            <div className="mb-6 rounded-lg bg-bg-gray p-4">
              <p className="text-xs text-text-dark mb-1">實踐名稱</p>
              <p className="text-sm font-medium text-text-dark">
                {String(draft.formValues.name)}
              </p>
            </div>
          ) : null
        }
        onRestore={handleRestoreDraft}
        onDiscard={clearDraft}
      />

      <PageHeader title={currentStep === 5 ? "預覽" : "建立實踐"} closeTo="/" />

      <main className="relative px-5 max-w-[448px] mx-auto pb-20">
        {/* Progress Bar */}
        {currentStep !== 5 && (
          <div className="mb-12">
            <div className="text-xs text-text-dark">
              {currentStep} / {TOTAL_STEPS}
            </div>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
                <Progress
                  key={index}
                  value={currentStep >= index + 1 ? 100 : 0}
                  className="h-1 [--active-color:var(--logo-cyan)] bg-bg-gray"
                />
              ))}
            </div>
          </div>
        )}

        {/* 檢查暫存資料時的遮罩 */}
        {isCheckingDraft && (
          <div className="fixed inset-0 z-40 bg-white/80 backdrop-blur-sm" />
        )}

        {/* Form */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {currentStep >= 2 && currentStep <= 4 && (
              <div>
                <h1 className="text-xl font-semibold text-text-dark mb-1">
                  {name}
                </h1>
                <p className="text-sm text-text-dark">
                  一次 {durationMinutes} 分鐘
                </p>
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
                onClick={
                  currentStep === 1 ? () => router.back() : handlePrevious
                }
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
                disabled={isCheckingDraft}
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
