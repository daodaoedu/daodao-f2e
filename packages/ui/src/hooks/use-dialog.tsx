"use client";

import { useDialogManager } from "../components/animate-ui/components/radix/dialog";
import { useCallback } from "react";
import type { DialogConfig, DialogAction } from "../components/animate-ui/components/radix/dialog-manager";
import { DialogContentWithImage } from "../components/dialog-content-with-image";
import InfoPng from "@daodao/assets/images/dialog/info.png";
import SuccessPng from "@daodao/assets/images/dialog/success.png";
import WarningPng from "@daodao/assets/images/dialog/warning.png";

/**
 * Dialog 預設配置
 */
const DEFAULT_DIALOG_CONFIG = {
  from: "bottom" as const,
  dismissible: true,
  closeOnEscape: true,
  showCloseButton: true,
} satisfies Partial<DialogConfig>;

/**
 * 嚴格模式的 Dialog 配置（不允許關閉）
 */
const STRICT_DIALOG_CONFIG = {
  from: "bottom" as const,
  dismissible: false,
  closeOnEscape: false,
  showCloseButton: false,
} satisfies Partial<DialogConfig>;

/**
 * Dialog 類型
 */
export type DialogType = "info" | "success" | "warning";

/**
 * Dialog 按鈕選項
 */
export interface DialogButton<TValue extends string = string> {
  /** 按鈕文字 */
  label: string;
  /** 按鈕樣式 */
  variant?: "default" | "outline" | "orange";
  /** 按鈕值（用於 Promise resolve） */
  value: TValue;
}

/**
 * Dialog 選項
 */
export interface DialogOptions<TValue extends string = string> {
  /** 標題 */
  title: string;
  /** 內容文字（會自動包裝在 DialogContentWithImage 中） */
  message?: React.ReactNode;
  /** 自訂內容（如果提供，會覆蓋 message） */
  content?: React.ReactNode;
  /** 按鈕配置 */
  buttons?: DialogButton<TValue>[];
  /** 是否為嚴格模式（不允許關閉） */
  strict?: boolean;
  /** 文字對齊方式 */
  textAlign?: "left" | "center";
  /** 容器樣式（用於 DialogContentWithImage） */
  containerClassName?: string;
  /** 自訂配置 */
  customConfig?: Partial<DialogConfig>;
}

/**
 * Dialog 結果
 */
export interface DialogResult<TValue extends string = string> {
  /** 選擇的按鈕值 */
  value: TValue;
  /** 選擇的按鈕索引 */
  index: number;
}

/**
 * 根據類型獲取對應的圖片
 */
function getDialogImage(type: DialogType) {
  switch (type) {
    case "info":
      return InfoPng;
    case "success":
      return SuccessPng;
    case "warning":
      return WarningPng;
  }
}

/**
 * 根據類型獲取預設按鈕配置
 */
function getDefaultButtons(type: DialogType): DialogButton<"confirm" | "cancel">[] {
  switch (type) {
    case "info":
      return [
        { label: "確定", value: "confirm", variant: "orange" },
      ];
    case "success":
      return [
        { label: "確定", value: "confirm", variant: "orange" },
      ];
    case "warning":
      return [
        { label: "取消", value: "cancel", variant: "outline" },
        { label: "確定", value: "confirm", variant: "orange" },
      ];
  }
}

/**
 * 統一的 Dialog Hook，類似 toast 的使用方式
 * 
 * @example
 * ```tsx
 * const { openInfoDialog, openSuccessDialog, openWarningDialog } = useDialog();
 * 
 * // 簡單使用
 * await openSuccessDialog({
 *   title: "操作成功",
 *   message: "您的操作已成功完成",
 * });
 * 
 * // 自訂按鈕（TypeScript 會自動推斷 result.value 為 "cancel" | "delete"）
 * const result = await openWarningDialog({
 *   title: "確定刪除？",
 *   message: "此操作無法復原",
 *   buttons: [
 *     { label: "取消", value: "cancel", variant: "outline" },
 *     { label: "刪除", value: "delete", variant: "orange" },
 *   ],
 * });
 * 
 * if (result.value === "delete") {
 *   // 執行刪除
 * }
 * ```
 */
export function useDialog() {
  const { open } = useDialogManager();

  const createDialog = useCallback(
    <TValue extends string = string>(
      type: DialogType,
      options: DialogOptions<TValue>
    ): Promise<DialogResult<TValue>> => {
      return new Promise((resolve) => {
        const {
          title,
          message,
          content,
          buttons: providedButtons,
          strict = false,
          textAlign = "left",
          containerClassName,
          customConfig,
        } = options;

        const buttons = providedButtons ?? getDefaultButtons(type);
        const image = getDialogImage(type);
        const baseConfig = strict ? STRICT_DIALOG_CONFIG : DEFAULT_DIALOG_CONFIG;

        // 構建內容
        const dialogContent =
          content ||
          (message ? (
            <DialogContentWithImage
              image={image}
              imageAlt={type}
              textAlign={textAlign}
              containerClassName={containerClassName}
            >
              {message}
            </DialogContentWithImage>
          ) : null);

        // 構建按鈕
        const actions: DialogAction[] = buttons.map((button, index) => ({
          label: button.label,
          variant: button.variant,
          onClick: () => {
            resolve({
              value: button.value as TValue,
              index,
            });
          },
        }));

        // 處理關閉事件
        const handleClose = () => {
          // 如果沒有按鈕，resolve 預設值
          if (buttons.length === 0) {
            resolve({ value: "close" as TValue, index: -1 });
          } else if (strict) {
            // 嚴格模式下，關閉時不 resolve（應該由按鈕觸發）
            return;
          } else {
            // 關閉時 resolve 第一個按鈕（通常是取消）
            resolve({
              value: (buttons[0]?.value || "close") as TValue,
              index: 0,
            });
          }
        };

        open({
          ...baseConfig,
          title,
          content: dialogContent,
          actions,
          onClose: handleClose,
          ...customConfig,
        });
      });
    },
    [open]
  );

  const openInfoDialog = useCallback(
    <TValue extends string = string>(options: DialogOptions<TValue>) =>
      createDialog<TValue>("info", options),
    [createDialog]
  );

  const openSuccessDialog = useCallback(
    <TValue extends string = string>(options: DialogOptions<TValue>) =>
      createDialog<TValue>("success", options),
    [createDialog]
  );

  const openWarningDialog = useCallback(
    <TValue extends string = string>(options: DialogOptions<TValue>) =>
      createDialog<TValue>("warning", options),
    [createDialog]
  );

  return {
    openInfoDialog,
    openSuccessDialog,
    openWarningDialog,
  };
}

