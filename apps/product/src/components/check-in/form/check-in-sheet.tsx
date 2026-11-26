"use client";

import { useLocale, useTranslations } from "@daodao/i18n";
import { useRouter } from "@daodao/i18n/navigation";
import { Button, type ButtonProps } from "@daodao/ui/components/button";
import { Form } from "@daodao/ui/components/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isBefore, startOfDay } from "date-fns";
import { CalendarCheck, Check, Eye, History } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { CheckInStatus } from "@/constants/check-in-status";
import { useCheckInSheet } from "@/hooks/use-check-in-sheet";
import { EarlyStartResult, useEarlyStartDialog } from "@/hooks/use-early-start-dialog";
import { parseLocalDate } from "@/utils/practice-period";
import type { ICheckInFormData, ICheckInStatusOptions } from "../types";
import { submitKeepingValuesOnError } from "./check-in-submit-flow";
import { DescriptionField } from "./components/description-field";
import { MediaUploadField } from "./components/media-upload-field";
import { MoodSelector } from "./components/mood-selector";
import { PreviousCheckIns } from "./components/previous-check-ins";
import { ReflectionQuestion } from "./components/reflection-question";
import { TagSelector } from "./components/tag-selector";
import { formatCheckInDescription, parseCheckInDescription } from "./description-answers";
import { useCheckInStatus } from "./hooks/use-check-in-status";
import { useCheckInSubmit } from "./hooks/use-check-in-submit";
import { type CheckInFormValuesType, createCheckInFormSchema } from "./schema";

export type { ICheckInFormData as CheckInData, ICheckInStatusOptions as CheckInStatusOptions };
export type { CheckInStatusType as CheckInStatus } from "@/constants/check-in-status";

/**
 * 打卡 Sheet 的內容組件（不包含 Sheet 外層）
 * 可用於 SheetManager 或直接使用 CheckInSheet
 */
interface ICheckInSheetContentProps {
  practiceId?: string;
  isEditing?: boolean;
  taskTitle: string;
  onComplete: (data: ICheckInFormData) => Promise<void> | void;
  /** 初始值（用於編輯模式） */
  initialValues?: Partial<ICheckInFormData>;
  /** 既有的圖片 URL（編輯模式時顯示） */
  existingImages?: string[];
  /** 提交按鈕文字 */
  submitButtonText?: string;
  /** 心情在打卡送出前選擇，或送出後於成功對話框選擇 */
  moodSelectionPosition?: "form" | "after";
}

export const CheckInSheetContent = ({
  practiceId,
  isEditing = false,
  taskTitle,
  onComplete,
  initialValues,
  existingImages,
  submitButtonText,
  moodSelectionPosition = "form",
}: ICheckInSheetContentProps) => {
  const t = useTranslations("check_in");
  const locale = useLocale();
  const resolvedSubmitButtonText = submitButtonText ?? t("submit_check_in");
  const initialDescriptionAnswers = parseCheckInDescription(initialValues?.description ?? "");
  const form = useForm<CheckInFormValuesType>({
    resolver: zodResolver(createCheckInFormSchema(t, locale, { isEditing })),
    defaultValues: {
      mood: initialValues?.mood ?? null,
      tags: initialValues?.tags ?? [],
      actionObservation: initialDescriptionAnswers.actionObservation,
      nextStep: initialDescriptionAnswers.nextStep,
      media: initialValues?.media ?? [],
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreviousCheckIns, setShowPreviousCheckIns] = useState(false);
  const [keptExistingImages, setKeptExistingImages] = useState<string[]>(existingImages ?? []);

  const onSubmit = async (values: CheckInFormValuesType) => {
    setIsSubmitting(true);
    try {
      // 失敗時不 reset，保留已填內容讓使用者重送（daodao#377）
      await submitKeepingValuesOnError(
        () =>
          onComplete({
            mood: values.mood,
            tags: values.tags,
            description: formatCheckInDescription(
              {
                actionObservation: values.actionObservation,
                nextStep: values.nextStep,
              },
              {
                nextStep: t("description_follow_up_next_step"),
              }
            ),
            media: values.media,
            existingImageUrls:
              keptExistingImages.length > 0 || existingImages?.length
                ? keptExistingImages
                : undefined,
          }),
        () => form.reset()
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="px-6">
        {/* Activity Title */}
        <div className="mb-8 flex items-center justify-between gap-3">
          <h2 className="min-w-0 text-md leading-8 font-medium text-bg-dark wrap-break-word">
            {taskTitle}
          </h2>
          {practiceId && (
            <Button
              type="button"
              variant="ghost"
              aria-expanded={showPreviousCheckIns}
              onClick={() => setShowPreviousCheckIns((visible) => !visible)}
              className="h-8 shrink-0 gap-1.5 px-2 text-xs font-medium text-logo-cyan hover:bg-logo-cyan/10 hover:text-logo-cyan"
            >
              <History className="size-3.5" aria-hidden="true" />
              {showPreviousCheckIns ? t("hide_checkin_history") : t("view_checkin_history")}
            </Button>
          )}
        </div>
        {showPreviousCheckIns && practiceId && <PreviousCheckIns practiceId={practiceId} />}

        {moodSelectionPosition === "form" && <MoodSelector form={form} />}

        {/* Thought Sharing (tags, description, media) */}
        <div className="mb-8">
          <h3 className="mb-3 text-base font-medium text-text-dark">
            {t("thought_sharing")}
            <span aria-hidden="true" className="ml-1 text-red-500">
              *
            </span>
            <span className="sr-only">{t("tags_required_hint")}</span>
          </h3>
          <TagSelector form={form} />
          <ReflectionQuestion />
          <DescriptionField form={form} isEditing={isEditing} />
          <MediaUploadField
            form={form}
            existingImages={existingImages}
            onExistingImagesChange={setKeptExistingImages}
          />
        </div>

        {/* Complete Button */}
        <div className="sticky bottom-0 left-0 right-0 border-t border-light-gray bg-white p-6 -mx-6 -mb-6">
          <Button type="submit" variant="orange" className="w-full" disabled={isSubmitting}>
            <Check className="size-4.5" />
            {isSubmitting ? t("saving") : resolvedSubmitButtonText}
          </Button>
        </div>
      </form>
    </Form>
  );
};

interface ICheckInButtonProps
  extends ICheckInStatusOptions,
    Omit<ButtonProps, "onClick" | "children"> {
  /**
   * 實踐 ID（用於 API 調用和導向總結頁面）
   */
  practiceId: string;
  /**
   * 共同挑戰實踐：期間固定，開始日前不可打卡、不提供提早開始（FR-CC-03、FR-CC-11）
   */
  isChallenge?: boolean;
  /**
   * 任務標題（用於顯示在 Sheet 中）
   */
  taskTitle: string;
  /**
   * 打卡完成回調函數（可選，用於額外的處理邏輯）
   */
  onComplete?: (data: ICheckInFormData) => void;
  /**
   * 是否顯示圖標
   */
  showIcon?: boolean;
  /** 固定顯示指定的按鈕文字，不依打卡狀態變動 */
  labelOverride?: string;
  /** 開啟打卡表單前執行；回傳 false 時中止打卡 */
  beforeCheckIn?: () => Promise<boolean>;
  /** 開始日前停用打卡，且不提供提早開始 */
  disableBeforeStartDate?: boolean;
  /** 掛載後自動開啟打卡表單一次（共用打卡連結使用）；不可打卡時不動作 */
  autoOpen?: boolean;
  /**
   * 打卡前的進度百分比（用於顯示進度動畫）
   */
  progressPercentage?: number;
  /**
   * 實踐結束日期 (ISO 格式字串，例如 "2026-01-31")
   * 用於判斷實踐是否已到期，到期後顯示「觀看總結」按鈕
   */
  endDate?: string | null;
}

/**
 * 統一的打卡按鈕組件
 * 根據打卡狀態自動顯示對應的文字和禁用狀態
 * - 實踐進行中：點擊打開 CheckInSheet
 * - 實踐已到期：點擊導向總結頁面
 */
export const CheckInButton = ({
  practiceStatus,
  lastCheckInDate,
  startDate,
  endDate,
  practiceId,
  isChallenge = false,
  taskTitle,
  onComplete,
  labelOverride,
  beforeCheckIn,
  disableBeforeStartDate = false,
  autoOpen = false,
  disabled: disabledProp,
  variant = "secondary",
  className,
  showIcon,
  progressPercentage = 0,
  ...props
}: ICheckInButtonProps) => {
  const router = useRouter();
  const preparingRef = useRef(false);
  const [preparing, setPreparing] = useState(false);
  const t = useTranslations("check_in");
  const { status, canCheckIn, canClick, getButtonLabel } = useCheckInStatus({
    practiceStatus,
    lastCheckInDate,
    endDate,
  });

  const { submitCheckIn } = useCheckInSubmit({
    practiceId,
    progressPercentage,
    onComplete,
  });

  const { openCheckInSheet } = useCheckInSheet({
    practiceId,
    taskTitle,
    // 建立成功才關 sheet；失敗時錯誤（toast 已在 submitCheckIn 顯示）往上丟，sheet 與內容保留
    onComplete: (data, { closeSheet }) => submitCheckIn(data, { onCreated: closeSheet }),
  });

  const { openEarlyStartDialog } = useEarlyStartDialog({
    startDate: startDate || "",
  });

  // API 日期保留日曆日語意，避免 ISO 午夜在負時差地區提前一天。
  const parsedStartDate = startDate ? parseLocalDate(startDate) : null;
  const isBeforeStartDate =
    parsedStartDate !== null && isBefore(startOfDay(new Date()), parsedStartDate);
  const isChallengeNotStarted = isChallenge && isBeforeStartDate;

  const handleClick = async () => {
    // 如果是觀看總結狀態，導向總結頁面
    if (status === CheckInStatus.viewSummary) {
      router.push(`/practices/${practiceId}/summary`);
      return;
    }

    if (!canCheckIn || isChallengeNotStarted || (disableBeforeStartDate && isBeforeStartDate))
      return;

    if (preparingRef.current) return;
    if (beforeCheckIn) {
      preparingRef.current = true;
      setPreparing(true);
      try {
        if (!(await beforeCheckIn())) return;
      } finally {
        preparingRef.current = false;
        setPreparing(false);
      }
    }

    // 檢查今天是否早於開始日期
    if (startDate) {
      const today = startOfDay(new Date());
      const parsedStartDate = parseLocalDate(startDate);
      if (parsedStartDate !== null && isBefore(today, parsedStartDate)) {
        // 彈出確認對話框，讓用戶決定是否提早開始
        const result = await openEarlyStartDialog();
        if (result !== EarlyStartResult.Confirmed) {
          // 用戶取消，不繼續打卡
          return;
        }
        // 用戶確認提早開始，繼續打卡流程
        // 後端會自動調整實踐的起迄日
      }
    }

    openCheckInSheet();
  };

  const autoOpenedRef = useRef(false);
  useEffect(() => {
    if (!autoOpen || autoOpenedRef.current || !canCheckIn) return;
    autoOpenedRef.current = true;
    void handleClick();
  });

  // 決定顯示的圖標
  const renderIcon = () => {
    if (!showIcon) return null;
    if (status === CheckInStatus.viewSummary) {
      return <Eye className="size-4.5 text-logo-cyan" />;
    }
    return <CalendarCheck className="size-4.5 text-logo-cyan" />;
  };

  let buttonLabel: string;
  if (status === CheckInStatus.viewSummary) {
    buttonLabel = getButtonLabel();
  } else if (labelOverride !== undefined && labelOverride !== null) {
    buttonLabel = labelOverride;
  } else if (isChallengeNotStarted) {
    buttonLabel = t("challenge_not_started");
  } else {
    buttonLabel = getButtonLabel();
  }

  return (
    <Button
      variant={variant}
      onClick={handleClick}
      disabled={
        preparing ||
        disabledProp ||
        !canClick ||
        isChallengeNotStarted ||
        (disableBeforeStartDate && isBeforeStartDate)
      }
      className={className}
      {...props}
    >
      {renderIcon()}
      {buttonLabel}
    </Button>
  );
};
