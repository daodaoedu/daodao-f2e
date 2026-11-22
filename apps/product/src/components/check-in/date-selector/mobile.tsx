"use client";

import { useLocale, useTranslations } from "@daodao/i18n";
import { useMediaQuery } from "@daodao/shared";
import { Button } from "@daodao/ui/components/button";
import { useSafeRouter } from "@daodao/ui/hooks/use-safe-router";
import { cn } from "@daodao/ui/lib/utils";
import { parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useCohortViewQuery } from "@/lib/cohort-view-query";
import { CheckInDateButton } from "./check-in-date-button";
import type { ICheckInDateSelectorProps } from "./types";

export const MobileCheckInDateSelector = ({
  checkInDates,
  checkIns,
  practiceId,
  activeCheckInId,
  activeDate,
  checkInCount,
  title,
  closeActionTo,
}: ICheckInDateSelectorProps) => {
  const t = useTranslations("check_in");
  const locale = useLocale();
  const router = useSafeRouter();
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [hasDateOverflow, setHasDateOverflow] = useState(false);

  const cohortViewQuery = useCohortViewQuery();
  const [isVisible, setIsVisible] = useState(true);
  const [visibleMonthLabel, setVisibleMonthLabel] = useState(() => {
    const date =
      checkInDates.find((item) => item.date === activeDate)?.date ?? checkInDates[0]?.date;
    return date
      ? new Intl.DateTimeFormat(locale, { month: "short", year: "numeric" }).format(parseISO(date))
      : "";
  });
  const lastScrollY = useRef(0);
  const navRef = useRef<HTMLElement>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 滑鼠拖曳滾動相關
  const isMouseDown = useRef(false);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);

  const updateVisibleMonthLabel = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const dateItems = Array.from(container.querySelectorAll<HTMLElement>("[data-check-in-date]"));
    if (dateItems.length === 0) return;
    // Keep the month label in sync with the first date reaching the strip's
    // visible left edge, rather than switching while that date is still off-screen.
    const monthLabelAnchor = containerRect.left + 40;
    const visibleItem =
      dateItems.reduce<{ item: HTMLElement; center: number } | undefined>((closest, item) => {
        const rect = item.getBoundingClientRect();
        const center = rect.left + rect.width / 2;
        if (center > monthLabelAnchor || (closest && center <= closest.center)) return closest;
        return { item, center };
      }, undefined)?.item ?? dateItems[0];
    const dateValue = visibleItem?.dataset.checkInDate;
    if (!dateValue) return;

    setVisibleMonthLabel(
      new Intl.DateTimeFormat(locale, { month: "short", year: "numeric" }).format(
        parseISO(dateValue)
      )
    );
  }, [locale]);

  // The date count alone cannot determine whether the strip fits on a narrow screen.
  useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const updateOverflow = () =>
      setHasDateOverflow(container.scrollWidth > container.clientWidth + 1);
    updateOverflow();
    const observer = new ResizeObserver(updateOverflow);
    observer.observe(container);
    const list = container.firstElementChild;
    if (list) observer.observe(list);
    return () => observer.disconnect();
  }, []);

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

  // 元件掛載時立即定位到選中的日期按鈕（不使用動畫，避免閃跳）
  useLayoutEffect(() => {
    if (!activeDate || !scrollContainerRef.current) return;

    const activeIndex = checkInDates.findIndex((item) => item.date === activeDate);
    if (activeIndex < 0) return;

    const buttons = scrollContainerRef.current.querySelectorAll("button");
    const activeButton = buttons[activeIndex];
    if (activeButton) {
      activeButton.scrollIntoView({ behavior: "instant", inline: "center", block: "nearest" });
    }
    requestAnimationFrame(updateVisibleMonthLabel);
  }, [activeDate, checkInDates, updateVisibleMonthLabel]);

  // 滑鼠拖曳：按下
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    isMouseDown.current = true;
    isDragging.current = false;
    dragStartX.current = e.pageX;
    dragScrollLeft.current = scrollContainerRef.current.scrollLeft;
  }, []);

  // 滑鼠拖曳：移動
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isMouseDown.current || !scrollContainerRef.current) return;
    const walk = e.pageX - dragStartX.current;
    // 超過 3px 才視為拖曳，避免影響按鈕點擊
    if (!isDragging.current && Math.abs(walk) > 3) {
      isDragging.current = true;
      if (navRef.current) navRef.current.style.cursor = "grabbing";
    }
    if (isDragging.current) {
      e.preventDefault();
      scrollContainerRef.current.scrollLeft = dragScrollLeft.current - walk;
    }
  }, []);

  // 滑鼠拖曳：放開
  const handleMouseUp = useCallback(() => {
    isMouseDown.current = false;
    if (navRef.current) {
      navRef.current.style.cursor = "";
    }
    // 延遲重置拖曳狀態，讓 click 事件能夠在 capture 階段被攔截
    if (isDragging.current) {
      requestAnimationFrame(() => {
        isDragging.current = false;
      });
    }
  }, []);

  // 攔截拖曳後的 click 事件，避免觸發非預期的頁面導航
  const handleClickCapture = useCallback((e: React.MouseEvent) => {
    if (isDragging.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  const scrollDates = useCallback(
    (direction: -1 | 1) => {
      const container = scrollContainerRef.current;
      if (!container) return;

      container.scrollBy({
        left: direction * Math.max(container.clientWidth * 0.75, 160),
        behavior: prefersReducedMotion ? "instant" : "smooth",
      });
    },
    [prefersReducedMotion]
  );

  // 處理日期選擇
  const handleDateSelect = (selectedCheckInId: string) => {
    if (selectedCheckInId !== activeCheckInId) {
      router.push(`/practices/${practiceId}/check-ins/${selectedCheckInId}${cohortViewQuery}`);
    }
  };

  // 處理關閉按鈕點擊
  const handleClose = () => {
    if (closeActionTo) {
      router.replace(closeActionTo);
      return;
    }

    router.replace("/");
  };

  return (
    <nav
      ref={navRef}
      className={cn(
        "fixed top-0 left-0 right-0 z-30 transition-[left,transform] duration-300 ease-in-out md:left-[calc(50%_+_var(--sidebar-center-offset))] md:right-auto md:w-[720px] md:max-w-[calc(100vw-40px)] md:-translate-x-1/2",
        !isVisible && "-translate-y-full"
      )}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClickCapture={handleClickCapture}
    >
      {/* 標題列 */}
      <div className="relative flex h-11 items-center justify-center px-4">
        {/* 中間標題，日期提示箭頭分置標題左右 */}
        {title && (
          <div className="flex items-center justify-center gap-2">
            {hasDateOverflow && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={t("date_scroll_left")}
                onClick={() => scrollDates(-1)}
                animation="none"
                className="size-7 text-bg-dark/60 hover:bg-bg-dark/5"
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
              </Button>
            )}
            <h1
              className="text-lg font-medium text-bg-dark"
              aria-describedby={hasDateOverflow ? "date-scroll-hint" : undefined}
            >
              {title}
            </h1>
            {checkInCount !== undefined && (
              <span className="rounded-md bg-white/45 px-1.5 py-0.5 text-[10px] font-semibold leading-3 text-bg-dark/75">
                {checkInCount}
              </span>
            )}
            {hasDateOverflow && (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={t("date_scroll_right")}
                  onClick={() => scrollDates(1)}
                  animation="none"
                  className="size-7 text-bg-dark/60 hover:bg-bg-dark/5"
                >
                  <ChevronRight className="size-4" aria-hidden="true" />
                </Button>
                <span id="date-scroll-hint" className="sr-only">
                  {t("date_scroll_hint")}
                </span>
              </>
            )}
          </div>
        )}

        {/* 右側關閉按鈕 */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          aria-label={t("close")}
          animation="none"
          className="absolute right-3 top-1/2 size-9 -translate-y-1/2 rounded-full bg-white/45 text-bg-dark/60 hover:bg-white/70"
        >
          <X className="size-5" />
        </Button>
      </div>

      {/* 日期選擇器 */}
      <div className="relative mx-2 mt-1 rounded-3xl border border-white/50 bg-[#E9FEFFB2]/65 shadow-sm backdrop-blur-lg md:mx-0">
        <p className="pointer-events-none absolute left-4 top-2 z-10 h-3 whitespace-nowrap text-[10px] font-medium text-bg-dark/75">
          {visibleMonthLabel}
        </p>
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto overscroll-x-contain scrollbar-hide px-4"
          onScroll={updateVisibleMonthLabel}
        >
          <ol className="mx-auto flex w-fit items-center justify-center gap-3 pb-3 pt-3 pr-48">
            {checkInDates.map((item) => {
              return (
                <li
                  key={item.id}
                  data-check-in-date={item.date}
                  className="flex shrink-0 flex-col items-center gap-1"
                >
                  <p className="h-3" aria-hidden="true" />
                  <CheckInDateButton
                    item={item}
                    checkIns={checkIns}
                    activeCheckInId={activeCheckInId}
                    activeDate={activeDate}
                    onSelect={handleDateSelect}
                  />
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </nav>
  );
};
