"use client";

import { useSafeRouter } from "@daodao/ui/hooks/use-safe-router";
import { Button } from "@daodao/ui/components/button";
import { cn } from "@daodao/ui/lib/utils";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CheckInDateButton } from "./check-in-date-button";
import type { ICheckInDateSelectorProps } from "./types";

export const MobileCheckInDateSelector = ({
  checkInDates,
  checkIns,
  practiceId,
  activeCheckInId,
  title,
  closeActionTo,
}: ICheckInDateSelectorProps) => {
  const router = useSafeRouter();
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  // 處理滾動時隱藏/顯示面板
  useEffect(() => {
    let rafId: number;
    let isScheduled = false;

    const handleScroll = () => {
      if (!isScheduled) {
        isScheduled = true;
        rafId = requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const scrollDelta = currentScrollY - lastScrollY.current;

          // 向下滾動時隱藏，向上滾動時顯示
          if (scrollDelta > 1) {
            setIsVisible(false);
          } else if (scrollDelta < -1) {
            setIsVisible(true);
          }

          lastScrollY.current = currentScrollY;
          isScheduled = false;
        });
      }
    };

    // 初始化滾動位置
    lastScrollY.current = window.scrollY;

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // 處理日期選擇
  const handleDateSelect = (selectedCheckInId: string) => {
    if (selectedCheckInId !== activeCheckInId) {
      router.push(`/practices/${practiceId}/check-ins/${selectedCheckInId}`);
    }
  };

  // 處理關閉按鈕點擊
  const handleClose = () => {
    if (closeActionTo) {
      router.push(closeActionTo);
    } else {
      router.back();
    }
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-30 bg-[#E9FEFFB2]/70 border-b-2 border-[#E9FEFFB2] rounded-b-3xl backdrop-blur-lg transition-transform duration-300 ease-in-out",
        !isVisible && "-translate-y-full"
      )}
    >
      {/* 標題列 */}
      <div className="flex items-center justify-between px-5 pt-4">
        {/* 左側佔位 */}
        <div className="w-10" />

        {/* 中間標題 */}
        {title && (
          <h1 className="text-lg font-medium text-bg-dark">{title}</h1>
        )}

        {/* 右側關閉按鈕 */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          aria-label="關閉"
          animation="none"
          className="text-light-gray bg-very-light-gray/50"
        >
          <X className="size-6" />
        </Button>
      </div>

      {/* 日期選擇器 */}
      <div className="overflow-x-auto scrollbar-hide px-10">
        <div className="flex items-center justify-center gap-4 w-fit pb-5 pt-4">
          {checkInDates.map((item, index) => (
            <CheckInDateButton
              key={item.id}
              item={item}
              index={index}
              checkIns={checkIns}
              activeCheckInId={activeCheckInId}
              onSelect={handleDateSelect}
            />
          ))}
        </div>
      </div>
    </nav>
  );
};
