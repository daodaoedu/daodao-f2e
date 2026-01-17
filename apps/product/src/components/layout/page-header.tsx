"use client";

import { ArrowLeftOutlineSvg } from "@daodao/assets";
import { useIsDesktop, useIsMobile } from "@daodao/shared";
import { Button } from "@daodao/ui/components/button";
import { useSafeRouter } from "@daodao/ui/hooks/use-safe-router";
import { cn } from "@daodao/ui/lib/utils";
import { X } from "lucide-react";

type PageHeaderProps = {
  /** 左側動作：'back' 顯示返回按鈕，null 顯示空佔位符 */
  leftAction?: "back" | null;
  /** 左側動作按鈕的文字，預設為 "返回" */
  leftLabel?: string;
  /** 左側動作按鈕的點擊處理函數，預設為 router.back() */
  onLeftAction?: () => void;
  /** 中間標題，可選 */
  title?: string;
  /** 右側關閉按鈕的點擊處理函數，預設為 router.back() */
  onRightAction?: () => void;
  /** 關閉按鈕的目標路由，設定後會使用 router.replace() */
  rightActionTo?: string;
  /** 右側動作按鈕的目標路由，設定後會使用 router.replace() */
  rightActionIcon?: React.ReactNode;
  /** 右側動作按鈕的文字，預設為 "關閉" */
  rightLabel?: string;
  /** 樣式變體：'default' 為預設樣式，'light' 為白色文字樣式 */
  variant?: "default" | "light";
  /** 在指定設備類型上停用 light 樣式，即使 variant 為 'light' 也不會套用 */
  disableLightOn?: "mobile" | "desktop";
  /** 自訂 className */
  className?: string;
};

export const PageHeader = ({
  leftAction = null,
  leftLabel = "返回",
  onLeftAction,
  title,
  onRightAction,
  rightActionIcon = null,
  rightActionTo,
  rightLabel = "關閉",
  variant = "default",
  disableLightOn,
  className,
}: PageHeaderProps) => {
  const router = useSafeRouter();
  const isMobile = useIsMobile();
  const isDesktop = useIsDesktop();

  const handleLeftAction = () => {
    if (onLeftAction) {
      onLeftAction();
    } else {
      router.back();
    }
  };

  const handleRightAction = () => {
    if (onRightAction) {
      onRightAction();
    } else if (rightActionTo) {
      router.replace(rightActionTo);
    } else {
      router.back();
    }
  };

  // 判斷是否應該停用 light 樣式
  const shouldDisableLight =
    (disableLightOn === "mobile" && isMobile) || (disableLightOn === "desktop" && isDesktop);

  const isLight = variant === "light" && !shouldDisableLight;

  return (
    <div
      className={cn(
        "relative max-w-[600px] mx-auto grid grid-cols-3 items-center px-5 py-4 md:pt-16",
        className
      )}
    >
      {/* Left Action */}
      <div className="flex items-center justify-start">
        {leftAction === "back" && (
          <Button
            variant="ghost"
            onClick={handleLeftAction}
            animation="none"
            className={cn("px-0 font-normal", isLight && "text-white hover:text-white")}
          >
            <ArrowLeftOutlineSvg className="size-6" />
            {leftLabel}
          </Button>
        )}
      </div>

      {/* Center Content */}
      <div className="flex items-center justify-center">
        {title && (
          <h1 className={cn("text-lg font-medium", isLight ? "text-white" : "text-bg-dark")}>
            {title}
          </h1>
        )}
      </div>

      {/* Right Action */}
      <div className="flex items-center justify-end">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRightAction}
          aria-label={rightLabel}
          animation="none"
          className={cn(
            isLight
              ? "text-white hover:text-white bg-very-light-gray/50"
              : "text-light-gray bg-very-light-gray/50"
          )}
        >
          {rightActionIcon ?? <X className={cn("size-6", isLight && "size-5")} />}
        </Button>
      </div>
    </div>
  );
};
