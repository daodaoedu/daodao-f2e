import { useCallback, useState } from "react";
import { Alert } from "react-native";

interface IUseCheckInSuccessDialogOptions {
  title: string;
  from?: number;
  to?: number;
}

interface IUseCheckInSuccessDialogReturn {
  /** 是否顯示成功對話框 */
  isOpen: boolean;
  /** 當前進度百分比 */
  percentage: number;
  /** 打開成功對話框 */
  openSuccessDialog: (dynamicFrom?: number, dynamicTo?: number) => Promise<{ value: string }>;
  /** 關閉成功對話框 */
  closeSuccessDialog: () => void;
}

/**
 * 管理打卡成功對話框狀態的 Hook
 *
 * @example
 * ```tsx
 * const { openSuccessDialog } = useCheckInSuccessDialog({
 *   title: "我的實踐",
 * });
 *
 * // 當需要顯示對話框時
 * const result = await openSuccessDialog(0, 50);
 * if (result.value === "complete") {
 *   await handleComplete();
 * }
 * ```
 */
export function useCheckInSuccessDialog({
  title,
  from = 0,
  to = 100,
}: IUseCheckInSuccessDialogOptions): IUseCheckInSuccessDialogReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [percentage, setPercentage] = useState(from);

  const openSuccessDialog = useCallback(
    (dynamicFrom?: number, dynamicTo?: number): Promise<{ value: string }> => {
      const finalFrom = dynamicFrom !== undefined ? dynamicFrom : from;
      const finalTo = dynamicTo !== undefined ? dynamicTo : to;

      setPercentage(finalTo);
      setIsOpen(true);

      return new Promise((resolve) => {
        Alert.alert(
          "打卡成功!",
          `${title}\n進度：${finalFrom}% → ${finalTo}%\n\n恭喜，你又成功行動了一次！`,
          [
            {
              text: "完成",
              onPress: () => {
                setIsOpen(false);
                resolve({ value: "complete" });
              },
            },
          ]
        );
      });
    },
    [title, from, to]
  );

  const closeSuccessDialog = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    percentage,
    openSuccessDialog,
    closeSuccessDialog,
  };
}
