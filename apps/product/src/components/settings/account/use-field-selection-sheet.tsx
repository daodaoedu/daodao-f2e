"use client";

import { useSheetManager } from "@daodao/ui/components/animate-ui/components/radix/sheet";
import { useCallback, useRef } from "react";
import { FieldSelectionSheetContent } from "./field-selection-sheet-content";

/** 領域選項類型 */
export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldSelectionData {
  /** 選中的領域值（英文 value） */
  selectedFields: string[];
}

interface UseFieldSelectionSheetOptions {
  /** 初始選中的領域值（英文 value） */
  initialFields?: string[];
  /** 可選的領域列表 { value, label } */
  availableFields: readonly FieldOption[];
  /** 最多選擇數量 */
  maxSelection: number;
  /** Sheet 標題 */
  title: string;
  /** 自訂欄位的標籤文字，例如「其他角色」或「其他領域」 */
  customFieldLabel?: string;
  /** 完成回調 */
  onComplete: (data: FieldSelectionData) => void;
  /** 關閉時的回調 */
  onClose?: () => void;
}

/**
 * 使用全局 SheetManager 來顯示領域選擇 Sheet 的 Hook
 */
export function useFieldSelectionSheet({
  initialFields = [],
  availableFields,
  maxSelection,
  title,
  customFieldLabel,
  onComplete,
  onClose,
}: UseFieldSelectionSheetOptions) {
  const { open } = useSheetManager();
  const closeRef = useRef<(() => void) | null>(null);

  const openFieldSelectionSheet = useCallback(() => {
    const { close } = open({
      title,
      content: (
        <FieldSelectionSheetContent
          initialFields={initialFields}
          availableFields={availableFields}
          maxSelection={maxSelection}
          customFieldLabel={customFieldLabel}
          onComplete={(data) => {
            onComplete(data);
            closeRef.current?.();
          }}
          onClose={() => {
            closeRef.current?.();
            onClose?.();
          }}
        />
      ),
      dismissible: true,
      closeOnEscape: true,
      showCloseButton: true,
      onClose: () => {
        onClose?.();
      },
    });
    closeRef.current = close;
  }, [
    initialFields,
    availableFields,
    maxSelection,
    title,
    customFieldLabel,
    onComplete,
    onClose,
    open,
  ]);

  return { openFieldSelectionSheet };
}
