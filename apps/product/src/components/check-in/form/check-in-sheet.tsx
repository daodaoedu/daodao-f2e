"use client";

import { Button, type ButtonProps } from "@daodao/ui/components/button";
import { CalendarCheck, Check } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@daodao/ui/components/form";
import { useCheckInSheet } from "@/hooks/use-check-in-sheet";
import { checkInFormSchema, type CheckInFormValuesType } from "./schema";
import { useCheckInImageRender } from "./hooks/use-check-in-image-render";
import { MoodSelector } from "./components/mood-selector";
import { TagSelector } from "./components/tag-selector";
import { DescriptionField } from "./components/description-field";
import { MediaUploadField } from "./components/media-upload-field";
import { useCheckInStatus } from "./hooks/use-check-in-status";
import { useCheckInSubmit } from "./hooks/use-check-in-submit";
import type { ICheckInFormData, ICheckInStatusOptions } from "../types";

export type {
  ICheckInFormData as CheckInData,
  ICheckInStatusOptions as CheckInStatusOptions,
};
export type { CheckInStatusType as CheckInStatus } from "@/constants/check-in-status";

/**
 * 打卡 Sheet 的內容組件（不包含 Sheet 外層）
 * 可用於 SheetManager 或直接使用 CheckInSheet
 */
interface ICheckInSheetContentProps {
  taskTitle: string;
  onComplete: (data: ICheckInFormData) => Promise<void> | void;
  onClose?: () => void;
}

export const CheckInSheetContent = ({
  taskTitle,
  onComplete,
  onClose,
}: ICheckInSheetContentProps) => {
  const form = useForm<CheckInFormValuesType>({
    resolver: zodResolver(checkInFormSchema),
    defaultValues: {
      mood: null,
      tags: [],
      description: "",
      media: [],
    },
  });

  const { isRendering, startRender, renderCheckInCard } =
    useCheckInImageRender({
      taskTitle,
      onComplete,
      onReset: () => {
        form.reset();
      },
    });

  const onSubmit = async (values: CheckInFormValuesType) => {
    // Zod 驗證已確保 mood 不是 null
    if (values.mood === null) {
      return;
    }

    // 保存表單資料
    const formData: ICheckInFormData = {
      mood: values.mood,
      tags: values.tags,
      description: values.description,
      media: values.media,
    };

    // 開始渲染流程
    await startRender(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="px-6">
        {/* Activity Title */}
        <h2 className="text-md leading-8 font-medium text-bg-dark wrap-break-word mb-8">
          {taskTitle}
        </h2>

        {/* Mood Selection */}
        <MoodSelector form={form} />

        {/* Thought Sharing */}
        <div className="mb-8">
          <h3 className="text-base font-medium mb-3 text-text-dark">
            想法分享
          </h3>
          <TagSelector form={form} />
          <DescriptionField form={form} />
        </div>

        {/* Media Upload */}
        <MediaUploadField form={form} />

        {/* Hidden CheckInCard for rendering */}
        {renderCheckInCard()}

        {/* Complete Button */}
        <div className="sticky bottom-0 left-0 right-0 border-t border-light-gray bg-white p-6 -mx-6 -mb-6">
          <Button
            type="submit"
            variant="orange"
            className="w-full"
            disabled={isRendering}
          >
            <Check className="size-4.5" />
            {isRendering ? "打卡中..." : "完成打卡"}
          </Button>
        </div>
      </form>
    </Form>
  );
};


interface ICheckInButtonProps
  extends ICheckInStatusOptions, Omit<ButtonProps, "onClick" | "children"> {
  /**
   * 實踐 ID（用於 API 調用）
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
}

/**
 * 統一的打卡按鈕組件
 * 根據打卡狀態自動顯示對應的文字和禁用狀態
 * 點擊後會自動打開 CheckInSheet（除非提供了自訂 onClick）
 */
export const CheckInButton = ({
  practiceStatus,
  lastCheckInDate,
  practiceId,
  taskTitle,
  onComplete,
  variant = "secondary",
  className,
  showIcon,
  progressPercentage = 0,
  ...props
}: ICheckInButtonProps) => {
  const { canCheckIn, getButtonLabel } = useCheckInStatus({
    practiceStatus,
    lastCheckInDate,
  });

  const { submitCheckIn } = useCheckInSubmit({
    practiceId,
    taskTitle,
    progressPercentage,
    onComplete,
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

  const handleClick = () => {
    if (!canCheckIn) return;
    openCheckInSheet();
  };

  return (
    <Button
      variant={variant}
      onClick={handleClick}
      disabled={!canCheckIn}
      className={className}
      {...props}
    >
      {showIcon && <CalendarCheck className="size-4.5 text-logo-cyan" />}
      {getButtonLabel()}
    </Button>
  );
};
