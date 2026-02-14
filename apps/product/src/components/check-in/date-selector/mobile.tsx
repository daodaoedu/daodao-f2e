"use client";

import { useSafeRouter } from "@daodao/ui/hooks/use-safe-router";
import { Button } from "@daodao/ui/components/button";
import { cn } from "@daodao/ui/lib/utils";
import { X } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
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
  const navRef = useRef<HTMLElement>(null);

  // 滑鼠拖曳滾動相關
  const isMouseDown = useRef(false);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);

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

  // 滑鼠拖曳：按下
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!navRef.current) return;
    isMouseDown.current = true;
    isDragging.current = false;
    dragStartX.current = e.pageX;
    dragScrollLeft.current = navRef.current.scrollLeft;
  }, []);

  // 滑鼠拖曳：移動
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isMouseDown.current || !navRef.current) return;
    const walk = e.pageX - dragStartX.current;
    // 超過 3px 才視為拖曳，避免影響按鈕點擊
    if (!isDragging.current && Math.abs(walk) > 3) {
      isDragging.current = true;
      navRef.current.style.cursor = "grabbing";
    }
    if (isDragging.current) {
      e.preventDefault();
      navRef.current.scrollLeft = dragScrollLeft.current - walk;
    }
  }, []);

  // 滑鼠拖曳：放開
  const handleMouseUp = useCallback(() => {
    isMouseDown.current = false;
    isDragging.current = false;
    if (navRef.current) {
      navRef.current.style.cursor = "";
    }
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
      ref={navRef}
      className={cn(
        "fixed top-0 left-0 right-0 z-30 bg-[#E9FEFFB2]/70 border-b-2 border-[#E9FEFFB2] rounded-b-3xl backdrop-blur-lg transition-transform duration-300 ease-in-out",
        !isVisible && "-translate-y-full"
      )}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
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
