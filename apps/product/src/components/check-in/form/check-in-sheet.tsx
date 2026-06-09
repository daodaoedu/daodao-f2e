"use client";

import { useTranslations } from "@daodao/i18n";
import { useRouter } from "@daodao/i18n/navigation";
import { Button, type ButtonProps } from "@daodao/ui/components/button";
import { Form } from "@daodao/ui/components/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isBefore, parse, startOfDay } from "date-fns";
import { CalendarCheck, Check, Eye } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { CheckInStatus } from "@/constants/check-in-status";
import { useCheckInPhase2Sheet } from "@/hooks/use-check-in-phase2-sheet";
import { useCheckInSheet } from "@/hooks/use-check-in-sheet";
import { EarlyStartResult, useEarlyStartDialog } from "@/hooks/use-early-start-dialog";
import type { ICheckInFormData, ICheckInStatusOptions } from "../types";
import { DescriptionField } from "./components/description-field";
import { MediaUploadField } from "./components/media-upload-field";
import { MoodSelector } from "./components/mood-selector";
import { ReflectionQuestion } from "./components/reflection-question";
import { TagSelector } from "./components/tag-selector";
import { useCheckInStatus } from "./hooks/use-check-in-status";
import { useCheckInSubmit } from "./hooks/use-check-in-submit";
import {
  type CheckInFormValuesType,
  createCheckInFormSchema,
  createCheckInPhase2Schema,
} from "./schema";

export type { ICheckInFormData as CheckInData, ICheckInStatusOptions as CheckInStatusOptions };
export type { CheckInStatusType as CheckInStatus } from "@/constants/check-in-status";

/**
 * 打卡 Sheet 的內容組件（不包含 Sheet 外層）
 * 可用於 SheetManager 或直接使用 CheckInSheet
 */
interface ICheckInSheetContentProps {
  taskTitle: string;
  onComplete: (data: ICheckInFormData) => Promise<void> | void;
  /** 初始值（用於編輯模式） */
  initialValues?: Partial<CheckInFormValuesType>;
  /** 既有的圖片 URL（編輯模式時顯示） */
  existingImages?: string[];
  /** 提交按鈕文字 */
  submitButtonText?: string;
  /** 是否顯示心情選擇（編輯模式用） */
  showMood?: boolean;
}

export const CheckInSheetContent = ({
  taskTitle,
  onComplete,
  initialValues,
  existingImages,
  submitButtonText,
  showMood = false,
}: ICheckInSheetContentProps) => {
  const t = useTranslations("check_in");
  const resolvedSubmitButtonText = submitButtonText ?? t("submit_check_in");
  const form = useForm<CheckInFormValuesType>({
    resolver: zodResolver(createCheckInFormSchema(t)),
    defaultValues: {
      mood: initialValues?.mood ?? null,
      tags: initialValues?.tags ?? [],
      description: initialValues?.description ?? "",
      media: initialValues?.media ?? [],
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [keptExistingImages, setKeptExistingImages] = useState<string[]>(existingImages ?? []);

  const onSubmit = async (values: CheckInFormValuesType) => {
    setIsSubmitting(true);
    try {
      await onComplete({
        mood: values.mood,
        tags: values.tags,
        description: values.description,
        media: values.media,
        existingImageUrls:
          keptExistingImages.length > 0 || existingImages?.length ? keptExistingImages : undefined,
      });
      form.reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="px-6">
        {/* Activity Title */}
        <h2 className="text-md leading-8 font-medium text-bg-dark wrap-break-word mb-8">
          {taskTitle}
        </h2>

        {/* Mood Selection (edit mode only) */}
        {showMood && <MoodSelector form={form} />}

        {/* Thought Sharing (tags, description, media) */}
        <div className="mb-8">
          <h3 className="text-base font-medium mb-3 text-text-dark">{t("thought_sharing")}</h3>
          <TagSelector form={form} />
          <DescriptionField form={form} beforeTextarea={<ReflectionQuestion />} />
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
  taskTitle,
  onComplete,
  variant = "secondary",
  className,
  showIcon,
  progressPercentage = 0,
  ...props
}: ICheckInButtonProps) => {
  const router = useRouter();
  const { status, canCheckIn, canClick, getButtonLabel } = useCheckInStatus({
    practiceStatus,
    lastCheckInDate,
    endDate,
  });

  const { openPhase2Sheet } = useCheckInPhase2Sheet({ practiceId, taskTitle });

  const { submitCheckIn } = useCheckInSubmit({
    practiceId,
    taskTitle,
    progressPercentage,
    onComplete,
    onOpenPhase2: openPhase2Sheet,
  });

  const { openCheckInSheet } = useCheckInSheet({
    taskTitle,
    onComplete: async (data) => {
      try {
        await submitCheckIn(data);
      } catch {
        // 錯誤已在 submitCheckIn 中處理
      }
    },
  });

  const { openEarlyStartDialog } = useEarlyStartDialog({
    startDate: startDate || "",
  });

  const handleClick = async () => {
    // 如果是觀看總結狀態，導向總結頁面
    if (status === CheckInStatus.viewSummary) {
      router.push(`/practices/${practiceId}/summary`);
      return;
    }

    if (!canCheckIn) return;

    // 檢查今天是否早於開始日期
    if (startDate) {
      const today = startOfDay(new Date());
      const practiceStartDate = startOfDay(parse(startDate, "yyyy-MM-dd", new Date()));
      if (isBefore(today, practiceStartDate)) {
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

  // 決定顯示的圖標
  const renderIcon = () => {
    if (!showIcon) return null;
    if (status === CheckInStatus.viewSummary) {
      return <Eye className="size-4.5 text-logo-cyan" />;
    }
    return <CalendarCheck className="size-4.5 text-logo-cyan" />;
  };

  return (
    <Button
      variant={variant}
      onClick={handleClick}
      disabled={!canClick}
      className={className}
      {...props}
    >
      {renderIcon()}
      {getButtonLabel()}
    </Button>
  );
};

// ============================================================================
// Phase 2 Sheet Content（想法分享 + 上傳照片）
// ============================================================================

interface ICheckInPhase2SheetContentProps {
  taskTitle: string;
  onComplete: (data: ICheckInFormData) => Promise<void> | void;
}

/**
 * 打卡第二階段表單
 * 讓使用者在打卡（標籤、心得）完成後，進一步選擇心情
 */
export const CheckInPhase2SheetContent = ({
  taskTitle,
  onComplete,
}: ICheckInPhase2SheetContentProps) => {
  const t = useTranslations("check_in");
  const form = useForm<CheckInFormValuesType>({
    resolver: zodResolver(createCheckInPhase2Schema(t)),
    defaultValues: {
      mood: null,
      tags: [],
      description: "",
      media: [],
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (values: CheckInFormValuesType) => {
    setIsSubmitting(true);
    try {
      await onComplete({
        mood: values.mood,
        tags: values.tags,
        description: values.description,
        media: values.media,
      });
      form.reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="px-6">
        {/* Activity Title */}
        <h2 className="text-md leading-8 font-medium text-bg-dark wrap-break-word mb-6">
          {taskTitle}
        </h2>

        {/* Mood Selection */}
        <MoodSelector form={form} />

        {/* Submit Button */}
        <div className="sticky bottom-0 left-0 right-0 border-t border-light-gray bg-white p-6 -mx-6 -mb-6">
          <Button type="submit" variant="orange" className="w-full" disabled={isSubmitting}>
            <Check className="size-4.5" />
            {isSubmitting ? t("saving") : t("save_notes")}
          </Button>
        </div>
      </form>
    </Form>
  );
};
