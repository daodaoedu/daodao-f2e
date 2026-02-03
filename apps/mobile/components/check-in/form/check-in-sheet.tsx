import { useCallback, useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { YStack, XStack, Text, Button, Spinner, ScrollView } from "tamagui";
import { Check, CalendarCheck } from "@tamagui/lucide-icons";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { colors } from "@/generated/design-tokens";
import type { ICheckInFormData, ICheckInStatusOptions } from "../types";
import { MoodSelector } from "./components/mood-selector";
import { TagSelector } from "./components/tag-selector";
import { DescriptionField } from "./components/description-field";
import { MediaUploadField } from "./components/media-upload-field";
import { useCheckInImageRender } from "./hooks/use-check-in-image-render";
import { useCheckInStatus } from "./hooks/use-check-in-status";
import { useCheckInSubmit } from "./hooks/use-check-in-submit";
import { type CheckInFormValuesType, checkInFormSchema } from "./schema";

// Export types for external use (avoid naming conflicts with legacy CheckInSheet)
export type { ICheckInFormData, ICheckInStatusOptions };
export type { CheckInStatusType } from "@/constants/check-in-status";

/**
 * 打卡 Sheet 的內容組件（不包含 Sheet 外層）
 * 可用於 SheetManager 或直接使用 CheckInSheet
 */
interface ICheckInSheetContentProps {
  taskTitle: string;
  onComplete: (data: ICheckInFormData) => Promise<void> | void;
}

export const CheckInSheetContent = ({ taskTitle, onComplete }: ICheckInSheetContentProps) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CheckInFormValuesType>({
    resolver: zodResolver(checkInFormSchema),
    defaultValues: {
      mood: null,
      tags: [],
      description: "",
      mediaUris: [],
    },
  });

  const { isRendering, startRender, renderCheckInCard } = useCheckInImageRender({
    taskTitle,
    onComplete,
    onReset: () => {
      reset();
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
      mediaUris: values.mediaUris,
    };

    // 開始渲染流程
    await startRender(formData);
  };

  // Watch form values for controlled components
  const mood = watch("mood");
  const tags = watch("tags");
  const description = watch("description");
  const mediaUris = watch("mediaUris");

  return (
    <YStack flex={1}>
      <ScrollView flex={1} contentContainerStyle={styles.scrollContent}>
        <YStack paddingHorizontal="$6">
          {/* Activity Title */}
          <Text
            fontSize={16}
            fontWeight="500"
            color={colors.text.dark}
            marginBottom="$6"
          >
            {taskTitle}
          </Text>

          {/* Mood Selection */}
          <Controller
            control={control}
            name="mood"
            render={({ field: { onChange, value } }) => (
              <MoodSelector value={value} onChange={onChange} />
            )}
          />
          {errors.mood && (
            <Text fontSize={12} color={colors.semantic.error} marginTop="$1">
              {errors.mood.message}
            </Text>
          )}

          {/* Thought Sharing */}
          <YStack marginBottom="$6">
            <Controller
              control={control}
              name="tags"
              render={({ field: { onChange, value } }) => (
                <TagSelector value={value} onChange={onChange} />
              )}
            />
            {errors.tags && (
              <Text fontSize={12} color={colors.semantic.error} marginTop="$1">
                {errors.tags.message}
              </Text>
            )}

            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, value } }) => (
                <DescriptionField value={value} onChange={onChange} />
              )}
            />
            {errors.description && (
              <Text fontSize={12} color={colors.semantic.error} marginTop="$1">
                {errors.description.message}
              </Text>
            )}
          </YStack>

          {/* Media Upload */}
          <Controller
            control={control}
            name="mediaUris"
            render={({ field: { onChange, value } }) => (
              <MediaUploadField value={value} onChange={onChange} />
            )}
          />

          {/* Hidden CheckInCard for rendering */}
          {renderCheckInCard()}
        </YStack>
      </ScrollView>

      {/* Complete Button */}
      <YStack
        paddingHorizontal="$6"
        paddingVertical="$4"
        borderTopWidth={1}
        borderTopColor={colors.border.light}
        backgroundColor={colors.basic.white}
      >
        <Button
          backgroundColor={colors.logo.orange}
          pressStyle={{ opacity: 0.8 }}
          onPress={handleSubmit(onSubmit)}
          disabled={isRendering}
          opacity={isRendering ? 0.7 : 1}
        >
          <XStack alignItems="center" gap="$2">
            {isRendering ? (
              <Spinner color={colors.basic.white} size="small" />
            ) : (
              <Check size={18} color={colors.basic.white} />
            )}
            <Text color={colors.basic.white} fontWeight="600">
              {isRendering ? "打卡中..." : "完成打卡"}
            </Text>
          </XStack>
        </Button>
      </YStack>
    </YStack>
  );
};

interface ICheckInButtonProps extends ICheckInStatusOptions {
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
  /**
   * 自定義樣式
   */
  style?: object;
}

/**
 * 統一的打卡按鈕組件 (Mobile)
 * 根據打卡狀態自動顯示對應的文字和禁用狀態
 *
 * NOTE: This component manages its own sheet state. If you need to use the
 * CheckInSheetContent in a custom sheet, use the hook from hooks/use-check-in-submit.
 */
export const CheckInButton = ({
  practiceStatus,
  lastCheckInDate,
  practiceId,
  taskTitle,
  onComplete,
  showIcon,
  progressPercentage = 0,
  style,
  onOpenSheet,
}: ICheckInButtonProps & { onOpenSheet?: () => void }) => {
  const { canCheckIn, getButtonLabel } = useCheckInStatus({
    practiceStatus,
    lastCheckInDate,
  });

  const handlePress = useCallback(() => {
    if (!canCheckIn) return;
    // Notify parent to open the sheet
    onOpenSheet?.();
  }, [canCheckIn, onOpenSheet]);

  return (
    <Pressable
      onPress={handlePress}
      disabled={!canCheckIn}
      style={({ pressed }) => [
        styles.button,
        !canCheckIn && styles.buttonDisabled,
        pressed && canCheckIn && styles.buttonPressed,
        style,
      ]}
      accessibilityLabel={getButtonLabel()}
      accessibilityRole="button"
      accessibilityState={{ disabled: !canCheckIn }}
    >
      <XStack alignItems="center" gap="$2">
        {showIcon && <CalendarCheck size={18} color={colors.primary.base} />}
        <Text
          color={canCheckIn ? colors.text.dark : colors.basic["400"]}
          fontWeight="500"
        >
          {getButtonLabel()}
        </Text>
      </XStack>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.light,
    backgroundColor: colors.basic.white,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPressed: {
    opacity: 0.8,
    backgroundColor: colors.basic["100"],
  },
});
