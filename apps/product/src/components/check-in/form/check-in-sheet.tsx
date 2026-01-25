"use client";

import { Button, type ButtonProps } from "@daodao/ui/components/button";
import { Checkbox } from "@daodao/ui/components/checkbox";
import { FileUpload } from "@daodao/ui/components/file-upload";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@daodao/ui/components/form";
import { Input } from "@daodao/ui/components/input";
import { RadioGroup, RadioGroupItem } from "@daodao/ui/components/radio-group";
import { Textarea } from "@daodao/ui/components/textarea";
import { cn } from "@daodao/ui/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { isSameDay, isValid, parse } from "date-fns";
import { CalendarCheck, Check, Plus, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CheckInStatus, type CheckInStatusType } from "@/constants/check-in-status";
import { MOOD_OPTIONS, type MoodType } from "@/constants/mood";
import { useCheckInSheet } from "@/hooks/use-check-in-sheet";
import { useCheckInSuccessDialog } from "@/hooks/use-check-in-success-dialog";
import type { ICheckInFormData, ICheckInStatusOptions } from "../types";

export type { ICheckInFormData as CheckInData, ICheckInStatusOptions as CheckInStatusOptions };
export type { CheckInStatusType as CheckInStatus } from "@/constants/check-in-status";

const AVAILABLE_TAGS = ["練習", "新概念", "實作", "有趣", "創造", "困難", "刻意練習"] as const;

// Zod schema for form validation
const checkInFormSchema = z.object({
  mood: z
    .enum(MOOD_OPTIONS.map((option) => option.id) as [MoodType, ...MoodType[]])
    .nullable()
    .refine((val) => val !== null, {
      message: "請選擇心情",
    }),
  tags: z.array(z.string()).min(1, "請至少選擇一個標籤"),
  description: z.string().min(1, "請輸入描述").max(300, "最多300字"),
  media: z.array(z.instanceof(File)).default([]),
});

type CheckInFormValuesType = ICheckInFormData;

/**
 * 打卡 Sheet 的內容組件（不包含 Sheet 外層）
 * 可用於 SheetManager 或直接使用 CheckInSheet
 */
interface ICheckInSheetContentProps {
  taskTitle: string;
  onComplete: (data: ICheckInFormData) => void;
  onClose?: () => void;
}

export const CheckInSheetContent = ({
  taskTitle,
  onComplete,
  onClose,
}: ICheckInSheetContentProps) => {
  const [customTagInput, setCustomTagInput] = useState("");

  const form = useForm<CheckInFormValuesType>({
    resolver: zodResolver(checkInFormSchema),
    defaultValues: {
      mood: null,
      tags: [],
      description: "",
      media: [],
    },
  });

  const descriptionLength = form.watch("description")?.length || 0;
  const mediaLength = form.watch("media")?.length || 0;
  const tags = form.watch("tags");

  const availableTags = useMemo(
    () => Array.from(new Set([...AVAILABLE_TAGS, ...(tags || [])])),
    [tags]
  );

  // 當 Sheet 關閉時清空輸入框
  useEffect(() => {
    return () => {
      setCustomTagInput("");
    };
  }, []);

  const onSubmit = (values: CheckInFormValuesType) => {
    // Zod 驗證已確保 mood 不是 null
    if (values.mood === null) {
      return;
    }
    onComplete({
      mood: values.mood,
      tags: values.tags,
      description: values.description,
      media: values.media,
    });
    form.reset();
    setCustomTagInput("");
    onClose?.();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="px-6">
        {/* Activity Title */}
        <h2 className="text-md leading-8 font-medium text-bg-dark wrap-break-word mb-8">
          {taskTitle}
        </h2>

        {/* Mood Selection */}
        <FormField
          control={form.control}
          name="mood"
          render={({ field }) => (
            <FormItem className="mb-8">
              <FormLabel className="block text-base font-medium mb-3 text-text-dark">
                心情如何?
              </FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  onBlur={field.onBlur}
                  className="flex justify-between"
                >
                  {MOOD_OPTIONS.map(({ id, label, emoji: Emoji }) => {
                    const isSelected = field.value === id;
                    const inputId = `mood-${id}`;
                    return (
                      <label
                        key={id}
                        htmlFor={inputId}
                        className={cn(
                          "flex flex-col items-center gap-1 opacity-30 transition-opacity cursor-pointer",
                          isSelected && "opacity-100"
                        )}
                      >
                        <RadioGroupItem
                          value={id}
                          id={inputId}
                          className="sr-only"
                          aria-label={label}
                        />
                        <Emoji className="size-12" />
                        <span className="text-xs text-gray-700">{label}</span>
                      </label>
                    );
                  })}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Thought Sharing */}
        <div className="mb-8">
          <h3 className="text-base font-medium mb-3 text-text-dark">想法分享</h3>
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => {
              const handleAddCustomTag = () => {
                const trimmedTag = customTagInput.trim();
                if (!trimmedTag) return;

                const currentTags = field.value || [];
                const tagExists = currentTags.includes(trimmedTag);

                if (!tagExists) {
                  field.onChange([...currentTags, trimmedTag]);
                }
                setCustomTagInput("");
              };

              const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddCustomTag();
                }
              };

              return (
                <FormItem className="mb-3">
                  <FormControl>
                    <div>
                      <div className="flex flex-wrap gap-x-2 gap-y-3 mb-3">
                        {availableTags.map((tag) => {
                          const isSelected = field.value?.includes(tag);
                          const checkboxId = `tag-${tag}`;
                          const handleToggle = () => {
                            const currentTags = field.value || [];
                            const newTags = isSelected
                              ? currentTags.filter((t: string) => t !== tag)
                              : [...currentTags, tag];
                            field.onChange(newTags);
                          };
                          return (
                            <div key={tag} className="flex items-center">
                              <Checkbox id={checkboxId} checked={isSelected} className="sr-only" />
                              <label
                                htmlFor={checkboxId}
                                className={cn(
                                  "px-5 py-1.5 text-sm rounded-full border transition-colors flex items-center gap-1 cursor-pointer",
                                  isSelected
                                    ? "bg-logo-gray text-white border-logo-gray"
                                    : "bg-white text-gray-700 border-logo-cyan hover:bg-logo-cyan/10"
                                )}
                                onClick={handleToggle}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    handleToggle();
                                  }
                                }}
                              >
                                <span>{tag}</span>
                                {isSelected && (
                                  <X
                                    className="size-4"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const currentTags = field.value || [];
                                      field.onChange(currentTags.filter((t: string) => t !== tag));
                                    }}
                                  />
                                )}
                              </label>
                            </div>
                          );
                        })}
                      </div>
                      {/* 自訂標籤輸入框 */}
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          placeholder="輸入自訂標籤"
                          value={customTagInput}
                          onChange={(e) => setCustomTagInput(e.target.value)}
                          onKeyDown={handleInputKeyDown}
                          className="flex-1"
                          aria-label="輸入自訂標籤"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="blue"
                          onClick={handleAddCustomTag}
                          disabled={!customTagInput.trim()}
                          aria-label="加入標籤"
                          className="h-8"
                        >
                          <Plus className="size-4" />
                          加入
                        </Button>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <FormLabel className="text-sm text-text-dark font-normal">詳細描述</FormLabel>

                  <FormDescription className="text-sm text-light-gray">
                    {descriptionLength}/300
                  </FormDescription>
                </div>
                <FormControl>
                  <Textarea {...field} placeholder="簡單紀錄今天的發現，或卡關的地方" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Media Upload */}
        <FormField
          control={form.control}
          name="media"
          render={({ field }) => (
            <FormItem className="mb-16 md:mb-8">
              <div className="mb-3 flex items-center justify-between gap-2">
                <FormLabel className="block text-base font-medium text-text-dark">
                  上傳照片或影片
                </FormLabel>

                <FormDescription className="text-sm text-light-gray">
                  已上傳 {mediaLength}/3 張
                </FormDescription>
              </div>
              <FormControl>
                <FileUpload
                  files={field.value}
                  onFilesChange={field.onChange}
                  accept="image/*,video/*"
                  multiple
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Complete Button */}
        <div className="sticky bottom-0 left-0 right-0 border-t border-light-gray bg-white p-6 -mx-6 -mb-6">
          <Button type="submit" variant="orange" className="w-full">
            <Check className="size-4.5" />
            完成打卡
          </Button>
        </div>
      </form>
    </Form>
  );
};

/**
 * 檢查指定日期是否為今天
 */
const isDateToday = (dateString: string | null | undefined): boolean => {
  if (!dateString) return false;

  try {
    const checkInDate = parse(dateString, "yyyy-MM-dd", new Date());

    if (!isValid(checkInDate)) return false;

    const today = new Date();
    return isSameDay(checkInDate, today);
  } catch {
    return false;
  }
};

/**
 * 檢查打卡狀態
 */
const useCheckInStatus = (options: ICheckInStatusOptions) => {
  const { practiceStatus, lastCheckInDate } = options;

  return useMemo(() => {
    // 檢查實踐是否已完成
    const isPracticeCompleted = practiceStatus === "completed" || practiceStatus === "archived";

    // 檢查今天是否已打卡
    const isTodayCheckedIn = isDateToday(lastCheckInDate);

    // 決定最終狀態（優先級：已完成 > 今天已打卡 > 可打卡）
    const getStatus = (): CheckInStatusType => {
      if (isPracticeCompleted) return CheckInStatus.practiceCompleted;
      if (isTodayCheckedIn) return CheckInStatus.alreadyCheckedIn;
      return CheckInStatus.available;
    };
    const status = getStatus();

    // 取得按鈕文字
    const getButtonLabel = (): string => {
      switch (status) {
        case CheckInStatus.practiceCompleted:
          return "實踐已完成";
        case CheckInStatus.alreadyCheckedIn:
          return "今天已打過卡囉！";
        case CheckInStatus.available:
          return "打卡";
        default:
          return "打卡";
      }
    };

    // 是否可以點擊
    const canCheckIn = status === CheckInStatus.available;

    return {
      status,
      isPracticeCompleted,
      isTodayCheckedIn,
      canCheckIn,
      getButtonLabel,
    };
  }, [practiceStatus, lastCheckInDate]);
};

interface ICheckInButtonProps
  extends ICheckInStatusOptions,
    Omit<ButtonProps, "onClick" | "children"> {
  /**
   * 任務標題（用於顯示在 Sheet 中）
   */
  taskTitle: string;
  /**
   * 打卡完成回調函數
   */
  onComplete: (data: ICheckInFormData) => void;
  /**
   * 是否顯示圖標
   */
  showIcon?: boolean;
}

/**
 * 統一的打卡按鈕組件
 * 根據打卡狀態自動顯示對應的文字和禁用狀態
 * 點擊後會自動打開 CheckInSheet（除非提供了自訂 onClick）
 */
export const CheckInButton = ({
  practiceStatus,
  lastCheckInDate,
  taskTitle,
  onComplete,
  variant = "secondary",
  className,
  showIcon,
  ...props
}: ICheckInButtonProps) => {
  const { canCheckIn, getButtonLabel } = useCheckInStatus({
    practiceStatus,
    lastCheckInDate,
  });

  // 使用 ref 來保存打卡資料，以便在成功對話框中使用
  const checkInDataRef = useRef<ICheckInFormData | null>(null);

  const { openSuccessDialog } = useCheckInSuccessDialog({
    title: taskTitle,
  });

  const handleCheckInSuccess = async () => {
    const result = await openSuccessDialog();
    if (result.value === "complete") {
      // 成功對話框關閉後，執行原本的完成回調
      if (checkInDataRef.current) {
        onComplete(checkInDataRef.current);
        checkInDataRef.current = null;
      }
    }
  };

  const { openCheckInSheet } = useCheckInSheet({
    taskTitle,
    onComplete: async (data) => {
      // 保存打卡資料
      checkInDataRef.current = data;
      // 顯示成功對話框（Sheet 會自動關閉）
      await handleCheckInSuccess();
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
