"use client";

import { useRouter } from "@daodao/i18n/navigation";
import { cn } from "@daodao/ui/lib/utils";
import { useEffect, useRef, useState } from "react";
import type { CheckInDateSelectorProps } from "./types";
import { CheckInDateButton } from "./check-in-date-button";

export const MobileCheckInDateSelector = ({
  checkInDates,
  checkIns,
  practiceId,
  activeCheckInId,
}: CheckInDateSelectorProps) => {
  const router = useRouter();
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

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 overflow-x-auto scrollbar-hide bg-[#E9FEFFB2]/70 border-b-2 border-[#E9FEFFB2] rounded-b-3xl backdrop-blur-lg transition-transform duration-300 ease-in-out px-10",
        !isVisible && "-translate-y-full"
      )}
    >
      <div className="flex items-center justify-center gap-4 w-fit pb-5 pt-[72px]">
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
    </nav>
  );
};

