import { useEffect, useRef, useState } from "react";
import { Children } from "react";

import { cn } from "@/utils/cn";
import ArrowIcon from "@/public/assets/icons/arrow.svg";
import Button from "@/shared/components/Button";

type CardContainerProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
  childWrapperClassName?: string;
  type?: "all" | "select";
  subtitle?: string;
  onClickRedirect?: () => void;
};

export const CardContainer = (props: CardContainerProps) => {
  const {
    className = "",
    childWrapperClassName = "",
    type = "all",
    title,
    subtitle,
    onClickRedirect,
    children,
  } = props;

  const [curIdx, setCurIdx] = useState(0);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const isFirstInView = curIdx === 0;
  const isLastInView = curIdx === cardRefs.current.length - 1;

  const onChangeSelectionIdx = (
    e: React.MouseEvent,
    direction: "prev" | "next"
  ) => {
    e.preventDefault();

    let newIdx = direction === "prev" ? curIdx - 1 : curIdx + 1;
    if (newIdx < 0) newIdx = 0;
    if (newIdx >= cardRefs.current.length) newIdx = cardRefs.current.length - 1;

    setCurIdx(newIdx);

    cardRefs.current[newIdx]?.scrollIntoView({
      behavior: "smooth",
      inline: "start", // 對齊左邊
      block: "nearest", // 最近的邊緣
    });
  };

  //! Todo 要處理大頁面 element inView 導致 setCurIdx 的邏輯問題
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, idx) => {
          // 確保 cardRefs.current 只有存在才會被設定
          const _cardRefs = cardRefs.current.filter(Boolean);
          const index = _cardRefs.indexOf(entry.target as HTMLDivElement);

          if (entry.isIntersecting) setCurIdx(index);
        });
      },
      { threshold: 0.5 }
    );

    cardRefs.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => {
      observer.disconnect(); // 清除所有監聽
    };
  }, [JSON.stringify(children)]);

  return (
    <section className={className}>
      <div className="flex justify-between items-center mb-6 md:mb-10">
        <div className="leading-[2.4rem] text-[1.5rem] font-bold text-basic-500">
          {title}
        </div>

        {/* 導向到全部頁面 */}
        {type === "all" && (
          <div
            className="flex gap-2 items-center justify-center text-xl leading-[1.875rem] text-basic-300 font-medium"
            onClick={onClickRedirect}
          >
            {subtitle}
            <ArrowIcon />
          </div>
        )}

        {/* 頁面選取行為 */}
        {type === "select" && (
          <div className="flex items-center justify-center gap-1">
            <Button
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center rotate-180",
                isFirstInView
                  ? "bg-basic-100"
                  : "bg-white border border-primary-lightest"
              )}
              onClick={(e) => onChangeSelectionIdx(e, "prev")}
            >
              <ArrowIcon color={isFirstInView ? "#92989A" : "#16B9B3"} />
            </Button>
            <Button
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center ",
                isLastInView
                  ? "bg-basic-100"
                  : "bg-white border border-primary-lightest"
              )}
              onClick={(e) => onChangeSelectionIdx(e, "next")}
            >
              <ArrowIcon color={isLastInView ? "#92989A" : "#16B9B3"} />
            </Button>
          </div>
        )}
      </div>

      <div className={childWrapperClassName}>
        {type === "all" && children}
        {type === "select" &&
          Children.map(children, (child, idx) => {
            return (
              <div
                key={idx}
                ref={(el: HTMLDivElement | null) => {
                  cardRefs.current[idx] = el;
                }}
              >
                {child}
              </div>
            );
          })}
      </div>
    </section>
  );
};
