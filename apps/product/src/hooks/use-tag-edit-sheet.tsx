"use client";

import { useTranslations } from "@daodao/i18n";
import { useSheetManager } from "@daodao/ui/components/animate-ui/components/radix/sheet";
import { useCallback, useRef } from "react";
import type { TagEditData } from "@/components/practice/create/manual/tag-edit-content";
import { TagEditSheetContent } from "@/components/practice/create/manual/tag-edit-content";

interface UseTagEditSheetOptions {
  /** Sheet 標題，預設「編輯標籤」 */
  title?: string;
  /** 初始標籤 */
  initialTags?: string[];
  /** 初始關鍵字 */
  initialKeyword?: string;
  /** 完成回調 */
  onComplete: (data: TagEditData) => void;
  /** 關閉時的回調 */
  onClose?: () => void;
}

/**
 * 使用全局 SheetManager 來顯示編輯標籤 Sheet 的 Hook
 *
 * @example
 * ```tsx
 * const { openTagEditSheet } = useTagEditSheet({
 *   initialTags: ["標籤1", "標籤2"],
 *   initialKeyword: "關鍵字",
 *   onComplete: handleComplete,
 *   onClose: handleClose,
 * });
 *
 * // 當需要顯示 Sheet 時
 * openTagEditSheet();
 * ```
 */
export function useTagEditSheet({
  title,
  initialTags = [],
  initialKeyword = "",
  onComplete,
  onClose,
}: UseTagEditSheetOptions) {
  const t = useTranslations("practice");
  const { open } = useSheetManager();
  const closeRef = useRef<(() => void) | null>(null);

  const openTagEditSheet = useCallback(() => {
    const { close } = open({
      title: title ?? t("tag_edit_title"),
      content: (
        <TagEditSheetContent
          initialTags={initialTags}
          initialKeyword={initialKeyword}
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
  }, [title, initialTags, initialKeyword, onComplete, onClose, open, t]);

  return { openTagEditSheet };
}
