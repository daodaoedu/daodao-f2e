"use client";

import { X } from "lucide-react";
import { useRouter } from "@daodao/i18n/navigation";
import { Button } from "@daodao/ui/components/button";
import { ArrowLeftOutlineSvg } from "@daodao/assets";
import { cn } from "@daodao/ui/lib/utils";
import type { ReactNode } from "react";

type PageHeaderProps = {
  /** 左側動作：'back' 顯示返回按鈕，null 顯示空佔位符 */
  leftAction?: "back" | null;
  /** 返回按鈕的文字，預設為 "返回" */
  backLabel?: string;
  /** 返回按鈕的點擊處理函數，預設為 router.back() */
  onBack?: () => void;
  /** 中間標題，可選 */
  title?: string;
  /** 中間自訂內容，優先於 title */
  centerContent?: ReactNode;
  /** 右側關閉按鈕的點擊處理函數，預設為 router.back() */
  onClose?: () => void;
  /** 關閉按鈕的目標路由，設定後會使用 router.replace() */
  closeTo?: string;
  /** 樣式變體：'default' 為預設樣式，'light' 為白色文字樣式 */
  variant?: "default" | "light";
  /** 自訂 className */
  className?: string;
};

export const PageHeader = ({
  leftAction = null,
  backLabel = "返回",
  onBack,
  title,
  centerContent,
  onClose,
  closeTo,
  variant = "default",
  className,
}: PageHeaderProps) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (closeTo) {
      router.replace(closeTo);
    } else {
      router.back();
    }
  };

  const isLight = variant === "light";

  return (
    <div
      className={cn(
        "max-w-[600px] mx-auto flex items-center justify-between px-5 py-4 md:pt-16",
        className
      )}
    >
      {/* Left Action */}
      {leftAction === "back" ? (
        <Button
          variant="ghost"
          onClick={handleBack}
          animation="none"
          className={cn(
            "px-0 font-normal",
            isLight && "text-white hover:text-white"
          )}
        >
          <ArrowLeftOutlineSvg className="size-6" />
          {backLabel}
        </Button>
      ) : (
        <div className="size-9" />
      )}

      {/* Center Content */}
      {centerContent ? (
        centerContent
      ) : title ? (
        <h1
          className={cn(
            "text-lg font-medium",
            isLight ? "text-white" : "text-bg-dark"
          )}
        >
          {title}
        </h1>
      ) : (
        <div />
      )}

      {/* Right Action */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClose}
        aria-label="關閉"
        animation="none"
        className={cn(
          isLight
            ? "text-white hover:text-white bg-very-light-gray/50"
            : "text-light-gray"
        )}
      >
        <X className={cn("size-6", isLight && "size-5")} />
      </Button>
    </div>
  );
};

