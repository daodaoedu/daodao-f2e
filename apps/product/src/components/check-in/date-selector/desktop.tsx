"use client";

import { useTranslations } from "@daodao/i18n";
import { useRouter } from "@daodao/i18n/navigation";
import { Button } from "@daodao/ui/components/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CheckInDateButton } from "./check-in-date-button";
import type { ICheckInDateSelectorProps } from "./types";

export const DesktopCheckInDateSelector = ({
  checkInDates,
  checkIns,
  practiceId,
  activeCheckInId,
}: ICheckInDateSelectorProps) => {
  const t = useTranslations("check_in");
  const router = useRouter();
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 處理日期選擇
  const handleDateSelect = (selectedCheckInId: string) => {
    if (selectedCheckInId !== activeCheckInId) {
      router.push(`/practices/${practiceId}/check-ins/${selectedCheckInId}`);
    }
  };

  // 處理滾動容器滾動事件
  useEffect(() => {
    if (!scrollContainerRef.current) {
      return;
    }

    const container = scrollContainerRef.current;

    // 更新滾動按鈕狀態
    const updateScrollButtons = () => {
      if (!scrollContainerRef.current) {
        return;
      }

      const currentContainer = scrollContainerRef.current;
      const { scrollTop, scrollHeight, clientHeight } = currentContainer;

      setCanScrollUp(scrollTop > 0);
      setCanScrollDown(scrollTop < scrollHeight - clientHeight - 1);
    };

    updateScrollButtons();
    container.addEventListener("scroll", updateScrollButtons);

    return () => {
      container.removeEventListener("scroll", updateScrollButtons);
    };
  }, []);

  // 處理上下箭頭滾動（一次滾動 5 個項目）
  const handleScrollUp = () => {
    if (!scrollContainerRef.current) {
      return;
    }

    const container = scrollContainerRef.current;
    const itemsPerPage = 5;
    // 動態計算項目高度：size-12 (48px) + gap-4 (16px) = 64px
    const itemHeight = 64;
    const scrollDistance = itemHeight * itemsPerPage;

    container.scrollBy({
      top: -scrollDistance,
      behavior: "smooth",
    });
  };

  const handleScrollDown = () => {
    if (!scrollContainerRef.current) {
      return;
    }

    const container = scrollContainerRef.current;
    const itemsPerPage = 5;
    // 動態計算項目高度：size-12 (48px) + gap-4 (16px) = 64px
    const itemHeight = 64;
    const scrollDistance = itemHeight * itemsPerPage;

    container.scrollBy({
      top: scrollDistance,
      behavior: "smooth",
    });
  };

  return (
    <nav className="fixed top-[180px] left-0 right-0">
      <div className="max-w-[600px] w-full mx-auto">
        <div className="w-12 ml-7">
          <div className="flex flex-col items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleScrollUp}
              disabled={!canScrollUp}
              className="text-white hover:text-white"
              aria-label={t("date_scroll_up")}
            >
              <ChevronUp className="size-6" />
            </Button>

            <div
              ref={scrollContainerRef}
              className="flex flex-col items-center gap-4 max-h-[306px] overflow-y-auto scrollbar-hide"
            >
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

            <Button
              variant="ghost"
              size="icon"
              onClick={handleScrollDown}
              disabled={!canScrollDown}
              className="text-white hover:text-white"
              aria-label={t("date_scroll_down")}
            >
              <ChevronDown className="size-6" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
