"use client";

import { useDialogManager } from "@daodao/ui/components/animate-ui/components/radix/dialog";
import { useCallback } from "react";
import { Image } from "@daodao/ui/components/image";
// TODO: 需要添加打卡成功插圖（黃色角色坐在藍色紙飛機裡，左邊有黃色星爆圖標，右邊有藍色曲線）
// 圖片路徑：packages/assets/images/dialog/check-in-success.png
import SuccessPng from "@daodao/assets/images/dialog/success.png";

interface UseCheckInSuccessDialogOptions {
  /** 標題 */
  title?: React.ReactNode;
  /** 描述文字 */
  description?: React.ReactNode;
  /** 分享按鈕文字 */
  shareButtonText?: string;
  /** 完成按鈕文字 */
  completeButtonText?: string;
  /** 自訂預覽內容的渲染函數 */
  content?: React.ReactNode;
  /** 分享的回調 */
  onShare?: () => void;
  /** 完成的回調 */
  onComplete: () => void;
}

const DEFAULT_CONTENT = (
  <div className="p-4">
    {/* TODO: 當 check-in-success.png 準備好後，替換為 CheckInSuccessPng */}
    <Image src={SuccessPng} alt="check-in-success" width={172} height={172} className="mx-auto pb-8" />
    <div className="text-left text-text-dark space-y-1">
      <p>恭喜，你又成功行動了一次！</p>
      <p>歡迎分享你的心得，和你有相同實踐的人會</p>
      <p>很想知道喔！</p>
    </div>
  </div>
);

/**
 * 使用全局 DialogManager 來顯示打卡成功對話框的 Hook
 *
 * @example
 * ```tsx
 * const { openSuccessDialog } = useCheckInSuccessDialog({
 *   onShare: handleShare,
 *   onComplete: handleComplete,
 * });
 *
 * // 當需要顯示對話框時
 * openSuccessDialog();
 * ```
 */
export function useCheckInSuccessDialog({
  title = "打卡成功!",
  description,
  shareButtonText = "分享心得",
  completeButtonText = "完成",
  content = DEFAULT_CONTENT,
  onShare,
  onComplete,
}: UseCheckInSuccessDialogOptions) {
  const { open } = useDialogManager();

  const openSuccessDialog = useCallback(() => {
    open({
      title,
      description,
      content,
      actions: [
        {
          label: shareButtonText,
          variant: "outline",
          onClick: onShare || (() => {}),
        },
        {
          label: completeButtonText,
          variant: "orange",
          onClick: onComplete,
        },
      ],
      from: "bottom",
      dismissible: true,
      closeOnEscape: true,
      showCloseButton: true,
    });
  }, [
    title,
    description,
    shareButtonText,
    completeButtonText,
    content,
    onShare,
    onComplete,
    open,
  ]);

  return { openSuccessDialog };
}

