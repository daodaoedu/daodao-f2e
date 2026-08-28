"use client";

import {
  batchCreatePractices,
  batchCreatePracticeTemplates,
  createPractice,
  createPracticeTemplate,
} from "@daodao/api";
import { ArrowLeftOutlineSvg, ArrowRightOutlineSvg } from "@daodao/assets";
import { useTranslations } from "@daodao/i18n";
import { useRouter } from "@daodao/i18n/navigation";
import { StorageEnum, useFormDraft } from "@daodao/shared";
import { Button } from "@daodao/ui/components/button";
import { Form } from "@daodao/ui/components/form";
import { Progress } from "@daodao/ui/components/progress";
import { toast } from "@daodao/ui/components/sonner";
import { useNavigationBlockerEffect } from "@daodao/ui/hooks/navigation-blocker";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type FieldErrors, type Path, useForm } from "react-hook-form";
import { BackgroundAnimation, PageHeader } from "@/components/layout";
import {
  applyOnboardingUpdateFromResponse,
  refreshOnboardingStatus,
} from "@/components/task-guide/onboarding-progress-context";
import { useRestoreDraftDialog } from "@/hooks/use-restore-draft-dialog";
import { CompletionDialog } from "./completion-dialog";
import { getBaseName, getEffectiveSegments } from "./derive";
import {
  createWizardFormSchema,
  defaultWizardValues,
  WIZARD_STEP_FIELDS,
  WIZARD_TOTAL_STEPS,
  type WizardFormValues,
  WizardMode,
} from "./schema";
import { StepAction } from "./step-action";
import { StepPreview } from "./step-preview";
import { StepRhythm } from "./step-rhythm";
import { StepTagsResources, type StepTagsResourcesHandle } from "./step-tags-resources";
import {
  extractCreatedNames,
  getStepForServerPath,
  mapServerPathToFormField,
  parseServerError,
} from "./submit-utils";
import {
  toBatchCreatePracticeRequest,
  toBatchCreateTemplateRequest,
  toCreatePracticeRequest,
  toCreateTemplateRequest,
} from "./to-request";

/** 個人實踐列表（「看看我的實踐」） */
const MY_PRACTICES_ROUTE = "/mine";
/** 使用者模版管理頁尚未存在（/manage 仍是佔位），先回模版挑選頁 */
const MY_TEMPLATES_ROUTE = "/practices/create";

const PREVIEW_STEP = WIZARD_TOTAL_STEPS;
const STEP_NUMBERS = Array.from({ length: WIZARD_TOTAL_STEPS }, (_, i) => i + 1);

const todayIso = () => format(new Date(), "yyyy-MM-dd");

export interface PracticeWizardProps {
  mode: WizardMode;
  /** 由模版等入口帶入的初始值（覆蓋預設） */
  initialValues?: Partial<WizardFormValues>;
  /** 由模版建立時帶上，server 記錄 template_id */
  templateId?: string;
  /** 送出前的守門（例如 requireAuth）；未提供時直接送出 */
  submitGuard?: (run: () => Promise<void>) => void;
}

/** 依 zod client 端驗證錯誤找出最早出錯的步驟 */
const firstStepWithErrors = (errors: FieldErrors<WizardFormValues>): number | null => {
  const errored = new Set(Object.keys(errors));
  for (const step of STEP_NUMBERS) {
    if ((WIZARD_STEP_FIELDS[step] ?? []).some((field) => errored.has(field))) return step;
  }
  return null;
};

export const PracticeWizard = ({
  mode,
  initialValues,
  templateId,
  submitGuard,
}: PracticeWizardProps) => {
  const t = useTranslations("practice");
  const router = useRouter();
  const isPersonal = mode === WizardMode.personal;

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdNames, setCreatedNames] = useState<string[]>([]);
  const [isDoneOpen, setIsDoneOpen] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const isRestoreDialogOpenRef = useRef(false);
  const stepTagsRef = useRef<StepTagsResourcesHandle>(null);

  const schema = useMemo(() => createWizardFormSchema(t), [t]);
  const defaultValues = useMemo<WizardFormValues>(
    () => ({ ...defaultWizardValues(mode, todayIso()), ...initialValues, mode }),
    [mode, initialValues]
  );

  const form = useForm<WizardFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onSubmit",
  });

  // ---------------------------------------------------------------------------
  // 草稿
  // ---------------------------------------------------------------------------
  const { draft, showRestoreDialog, isCheckingDraft, restoreDraft, clearDraft } =
    useFormDraft<WizardFormValues>({
      storageKey: StorageEnum.PracticeWizardDraft,
      form,
      currentStep,
    });

  const handleRestoreDraft = useCallback(() => {
    restoreDraft();
    const step = draft?.currentStep;
    if (step && step >= 1 && step <= WIZARD_TOTAL_STEPS) {
      setCurrentStep(step);
    }
  }, [draft, restoreDraft]);

  const { openRestoreDialog } = useRestoreDraftDialog({ draft });

  useEffect(() => {
    if (!showRestoreDialog || isRestoreDialogOpenRef.current) return;
    const run = async () => {
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
    void run();
  }, [showRestoreDialog, openRestoreDialog, handleRestoreDraft, clearDraft]);

  useNavigationBlockerEffect(form.formState.isDirty && !isDone);

  // ---------------------------------------------------------------------------
  // 步驟切換
  // ---------------------------------------------------------------------------
  const goToStep = useCallback((step: number) => {
    window.scrollTo(0, 0);
    setCurrentStep(step);
  }, []);

  const handleNext = async () => {
    if (currentStep === 3 && stepTagsRef.current?.commitPending() === false) return;
    const isValid = await form.trigger(WIZARD_STEP_FIELDS[currentStep] ?? []);
    if (!isValid) return;
    if (currentStep < PREVIEW_STEP) goToStep(currentStep + 1);
  };

  // Step 1 的「上一步」不產生動作（spec FR-0.6）
  const handlePrevious = () => {
    if (currentStep > 1) goToStep(currentStep - 1);
  };

  // ---------------------------------------------------------------------------
  // 送出
  // ---------------------------------------------------------------------------
  const nameFallback = t("wizard_name_fallback");

  const applyServerError = (error: unknown) => {
    const parsed = parseServerError(error);
    let targetStep: number | null = null;

    for (const detail of parsed.details) {
      if (!detail.path || !detail.message) continue;
      const field = mapServerPathToFormField(detail.path);
      if (field) {
        form.setError(field as Path<WizardFormValues>, { type: "server", message: detail.message });
      }
      const step = getStepForServerPath(detail.path);
      if (step !== null && (targetStep === null || step < targetStep)) targetStep = step;
    }

    const firstMessage = parsed.details.find((d) => d.message)?.message;
    toast.error(firstMessage ?? parsed.message ?? t("wizard_create_failed"));
    if (targetStep !== null) goToStep(targetStep);
  };

  const submit = async (values: WizardFormValues) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const segmented = values.isSegmented && values.segments.length > 0;
      let response: { data?: unknown; error?: unknown };

      if (isPersonal) {
        const opts = { nameFallback, templateId, privacyStatus: "public" as const };
        response = segmented
          ? await batchCreatePractices(toBatchCreatePracticeRequest(values, opts))
          : await createPractice(toCreatePracticeRequest(values, opts));
      } else {
        const opts = { nameFallback };
        response = segmented
          ? await batchCreatePracticeTemplates(toBatchCreateTemplateRequest(values, opts))
          : await createPracticeTemplate(toCreateTemplateRequest(values, opts));
      }

      if (response.error) {
        console.error("Failed to create practice:", response.error);
        applyServerError(response.error);
        return;
      }

      clearDraft();
      if (isPersonal && !applyOnboardingUpdateFromResponse(response.data)) {
        refreshOnboardingStatus();
      }

      const names = extractCreatedNames(response.data);
      setCreatedNames(
        names.length > 0 ? names : getEffectiveSegments(values, nameFallback).map((s) => s.name)
      );
      setIsDone(true);
      window.scrollTo(0, 0);
      setIsDoneOpen(true);
    } catch (error) {
      console.error("Failed to create practice:", error);
      toast.error(error instanceof Error ? error.message : t("wizard_create_failed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInvalid = (errors: FieldErrors<WizardFormValues>) => {
    const step = firstStepWithErrors(errors);
    if (step !== null && step !== currentStep) goToStep(step);
  };

  const handleFinish = () => {
    const run = () => form.handleSubmit(submit, handleInvalid)();
    if (submitGuard) {
      submitGuard(run);
      return;
    }
    void run();
  };

  // ---------------------------------------------------------------------------
  // 完成彈窗
  // ---------------------------------------------------------------------------
  const handleDonePrimary = () => {
    setIsDoneOpen(false);
    router.push(isPersonal ? MY_PRACTICES_ROUTE : MY_TEMPLATES_ROUTE);
  };

  const handleDoneSecondary = () => {
    setIsDoneOpen(false);
    setIsDone(false);
    setCreatedNames([]);
    form.reset(defaultWizardValues(mode, todayIso()));
    form.clearErrors();
    goToStep(1);
  };

  // ---------------------------------------------------------------------------
  // 顯示用
  // ---------------------------------------------------------------------------
  const watchedName = form.watch("name");
  const watchedAction = form.watch("action");
  const isSegmented = form.watch("isSegmented");
  const segmentsLength = form.watch("segments").length;
  const displayName = getBaseName({ name: watchedName, action: watchedAction }, nameFallback);
  const segmentCount = isSegmented && segmentsLength > 0 ? segmentsLength : 1;

  const isPreview = currentStep === PREVIEW_STEP;
  const showSummary = currentStep === 2 || currentStep === 3;

  let finishLabel: string;
  if (isPersonal) {
    finishLabel =
      segmentCount > 1
        ? t("wizard_finish_personal_multi", { count: segmentCount })
        : t("wizard_finish_personal");
  } else {
    finishLabel =
      segmentCount > 1
        ? t("wizard_finish_template_multi", { count: segmentCount })
        : t("wizard_finish_template");
  }

  return (
    <div className="relative z-10 min-h-screen w-screen overflow-hidden overflow-y-auto bg-white">
      <BackgroundAnimation />

      <PageHeader
        title={isPreview ? t("wizard_title_preview") : t("wizard_title_create")}
        rightActionTo="/"
        rightLabel={t("wizard_close")}
      />

      <main className="relative mx-auto max-w-[448px] px-5 pb-28">
        {!isPreview && (
          <div className="mb-10">
            <div className="text-xs text-text-dark">
              {t("wizard_step_of", { current: currentStep, total: WIZARD_TOTAL_STEPS })}
            </div>
            <div className="flex items-center gap-0.5">
              {STEP_NUMBERS.map((step) => (
                <Progress
                  key={step}
                  value={currentStep >= step ? 100 : 0}
                  className="h-1 bg-bg-gray [--active-color:var(--logo-cyan)]"
                />
              ))}
            </div>
          </div>
        )}

        {isCheckingDraft && <div className="fixed inset-0 z-40 bg-white/80 backdrop-blur-sm" />}

        <Form {...form}>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            {showSummary && (
              <div>
                <h1 className="mb-1 text-xl font-semibold text-text-dark break-words">
                  {displayName}
                </h1>
                <p className="text-sm text-text-dark whitespace-pre-wrap break-words">
                  {watchedAction}
                </p>
              </div>
            )}

            {currentStep === 1 && <StepAction form={form} />}
            {currentStep === 2 && <StepRhythm form={form} />}
            {currentStep === 3 && <StepTagsResources ref={stepTagsRef} form={form} />}
            {isPreview && <StepPreview form={form} />}

            <footer className="fixed right-0 bottom-0 left-0 flex justify-center gap-6 border-t border-light-gray bg-very-light-gray p-6">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                className="group w-full sm:max-w-[288px]"
                disabled={isCheckingDraft || isSubmitting}
              >
                <ArrowLeftOutlineSvg className="size-4.5 text-logo-cyan group-hover:text-white" />
                {t("wizard_prev")}
              </Button>

              <Button
                type="button"
                onClick={isPreview ? handleFinish : handleNext}
                className="w-full sm:max-w-[288px]"
                disabled={isCheckingDraft || isSubmitting}
              >
                {isPreview ? finishLabel : t("wizard_next")}
                {!isPreview && <ArrowRightOutlineSvg className="size-4.5" />}
              </Button>
            </footer>
          </form>
        </Form>
      </main>

      <CompletionDialog
        open={isDoneOpen}
        mode={mode}
        names={createdNames}
        onPrimary={handleDonePrimary}
        onSecondary={handleDoneSecondary}
        onClose={() => setIsDoneOpen(false)}
      />
    </div>
  );
};
