"use client";

import { useDialogManager } from "@daodao/ui/components/animate-ui/components/radix/dialog";
import { useCallback } from "react";
import { Image } from "@daodao/ui/components/image";
import SuccessPng from "@daodao/assets/images/dialog/success.png";

interface UseCheckInSuccessDialogOptions {
  /** 分享的回調 */
  onShare?: () => void;
  /** 完成的回調 */
  onComplete: () => void;
}

const DIALOG_CONTENT = (
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

const DIALOG_TITLE = "打卡成功!";
const SHARE_BUTTON_TEXT = "分享心得";
const COMPLETE_BUTTON_TEXT = "完成";

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
  onShare,
  onComplete,
}: UseCheckInSuccessDialogOptions) {
  const { open } = useDialogManager();

  const openSuccessDialog = useCallback(() => {
    open({
      title: DIALOG_TITLE,
      content: DIALOG_CONTENT,
      actions: [
        {
          label: SHARE_BUTTON_TEXT,
          variant: "outline",
          onClick: onShare || (() => {}),
        },
        {
          label: COMPLETE_BUTTON_TEXT,
          variant: "orange",
          onClick: onComplete,
        },
      ],
      from: "bottom",
      dismissible: true,
      closeOnEscape: true,
      showCloseButton: true,
    });
  }, [onShare, onComplete, open]);

  return { openSuccessDialog };
}

