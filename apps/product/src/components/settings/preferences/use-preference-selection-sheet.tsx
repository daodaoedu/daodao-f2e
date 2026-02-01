"use client";

import { useSheetManager } from "@daodao/ui/components/animate-ui/components/radix/sheet";
import { useCallback, useRef } from "react";
import { PreferenceSelectionSheetContent } from "./preference-selection-sheet-content";

export interface PreferenceSelectionData {
  selectedOptionIds: number[];
}

interface UsePreferenceSelectionSheetOptions {
  /** 初始選中的選項 ID */
  initialOptionIds?: number[];
  /** 可選的選項列表 */
  availableOptions: Array<{
    id: number;
    name: string;
    value: string;
    description?: string | null;
  }>;
  /** 最多選擇數量 */
  maxSelection: number | null;
  /** Sheet 標題 */
  title: string;
  /** 完成回調 */
  onComplete: (data: PreferenceSelectionData) => void;
  /** 關閉時的回調 */
  onClose?: () => void;
}

/**
 * 使用全局 SheetManager 來顯示偏好選擇 Sheet 的 Hook
 */
export function usePreferenceSelectionSheet({
  initialOptionIds = [],
  availableOptions,
  maxSelection,
  title,
  onComplete,
  onClose,
}: UsePreferenceSelectionSheetOptions) {
  const { open } = useSheetManager();
  const closeRef = useRef<(() => void) | null>(null);

  const openPreferenceSelectionSheet = useCallback(() => {
    const { close } = open({
      title,
      content: (
        <PreferenceSelectionSheetContent
          initialOptionIds={initialOptionIds}
          availableOptions={availableOptions}
          maxSelection={maxSelection}
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
  }, [initialOptionIds, availableOptions, maxSelection, title, onComplete, onClose, open]);

  return { openPreferenceSelectionSheet };
}
