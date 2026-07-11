import { type ReactElement, useCallback, useRef, useState } from "react";
import {
  CheckInSuccessDialog,
  type CheckInSuccessDialogProps,
} from "@/components/check-in/CheckInSuccessDialog";

interface IUseCheckInSuccessDialogOptions {
  title: string;
  from?: number;
  to?: number;
}

interface IUseCheckInSuccessDialogReturn {
  isOpen: boolean;
  from: number;
  to: number;
  encouragement?: string;
  practiceTitle: string;
  openSuccessDialog: (
    dynamicFrom?: number,
    dynamicTo?: number,
    encouragement?: string
  ) => Promise<{ value: string }>;
  completeSuccessDialog: () => void;
  closeSuccessDialog: () => void;
  /**
   * 直接 render 即可（對齊 product DialogManager 自動掛載）。
   * 使用端：`{successDialog.SuccessDialog}`
   */
  SuccessDialog: ReactElement | null;
}

/**
 * 管理打卡成功對話框（Mobile）
 *
 * 對齊 product `useCheckInSuccessDialog`：
 * - `openSuccessDialog(from, to, encouragement)` 回傳 Promise
 * - 完成 → `{ value: "complete" }`；遮罩關閉 → `{ value: "close" }`
 * - 獨立 Modal，含進度動畫 / 煙火 / 鼓勵語
 */
export function useCheckInSuccessDialog({
  title,
  from: defaultFrom = 0,
  to: defaultTo = 100,
}: IUseCheckInSuccessDialogOptions): IUseCheckInSuccessDialogReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [encouragement, setEncouragement] = useState<string | undefined>();
  const resolveRef = useRef<((value: { value: string }) => void) | null>(null);

  const openSuccessDialog = useCallback(
    (
      dynamicFrom?: number,
      dynamicTo?: number,
      nextEncouragement?: string
    ): Promise<{ value: string }> => {
      const finalFrom = dynamicFrom !== undefined ? dynamicFrom : defaultFrom;
      const finalTo = dynamicTo !== undefined ? dynamicTo : defaultTo;

      setFrom(finalFrom);
      setTo(finalTo);
      setEncouragement(nextEncouragement);
      setIsOpen(true);

      return new Promise((resolve) => {
        resolveRef.current = resolve;
      });
    },
    [defaultFrom, defaultTo]
  );

  const completeSuccessDialog = useCallback(() => {
    setIsOpen(false);
    resolveRef.current?.({ value: "complete" });
    resolveRef.current = null;
  }, []);

  const closeSuccessDialog = useCallback(() => {
    setIsOpen(false);
    resolveRef.current?.({ value: "close" });
    resolveRef.current = null;
  }, []);

  const dialogProps: CheckInSuccessDialogProps = {
    open: isOpen,
    practiceTitle: title,
    from,
    to,
    encouragement,
    onComplete: completeSuccessDialog,
    onDismiss: closeSuccessDialog,
  };

  return {
    isOpen,
    from,
    to,
    encouragement,
    practiceTitle: title,
    openSuccessDialog,
    completeSuccessDialog,
    closeSuccessDialog,
    // 始終掛載，靠 open 控制顯示（對齊 product DialogManager）
    SuccessDialog: <CheckInSuccessDialog {...dialogProps} />,
  };
}
