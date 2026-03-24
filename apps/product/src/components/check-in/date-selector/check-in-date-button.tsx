"use client";

import { Button } from "@daodao/ui/components/button";
import { cn } from "@daodao/ui/lib/utils";
import type { ICheckInDate, ICheckInDisplayData } from "../types";

interface ICheckInDateButtonProps {
  item: ICheckInDate;
  index: number;
  checkIns: Record<string, ICheckInDisplayData>;
  activeCheckInId: string;
  /** 目前打卡的日期（yyyy-MM-dd），用於同日多筆打卡時正確高亮 */
  activeDate?: string;
  onSelect: (checkInId: string) => void;
  className?: string;
}

/**
 * 根據打卡次數計算橘色填充的透明度
 * 1 次 = 10%, 2 次 = 20%, ..., 10 次以上 = 100%
 */
const getCheckInOpacity = (checkInCount: number): number => {
  if (checkInCount <= 0) return 0;
  return Math.min(checkInCount * 0.1, 1);
};

export const CheckInDateButton = ({
  item,
  index,
  checkIns,
  activeCheckInId,
  activeDate,
  onSelect,
  className,
}: ICheckInDateButtonProps) => {
  const hasCheckIn = item.hasCheckIn ?? !!checkIns[item.id];
  // 優先使用日期比對（支援同日多筆打卡切換時仍正確高亮），否則降級為 ID 比對
  const isActive =
    hasCheckIn && (activeDate ? item.date === activeDate : item.id === activeCheckInId);
  // 計算打卡次數對應的透明度
  const checkInCount = item.checkInCount ?? (hasCheckIn ? 1 : 0);
  const fillOpacity = getCheckInOpacity(checkInCount);

  return (
    <Button
      key={item.id}
      onClick={() => {
        if (hasCheckIn) {
          onSelect(item.id);
        }
      }}
      variant="white"
      disabled={!hasCheckIn}
      className={cn(
        "relative size-12 shrink-0 overflow-hidden",
        // 所有按鈕都是白色底（避免背景透出）
        "bg-white",
        // 當前選擇：橘色邊框
        isActive && "ring-2 ring-[#FF9D00] ring-offset-0",
        // 文字顏色
        hasCheckIn ? "text-logo-cyan" : "text-logo-cyan/50",
        // 無打卡時的樣式
        !hasCheckIn && "cursor-not-allowed",
        className
      )}
      style={{
        // 有打卡時使用漸層背景實現橘色填充效果
        background: hasCheckIn
          ? `linear-gradient(to bottom, rgba(255, 157, 0, ${fillOpacity}), rgba(255, 157, 0, ${fillOpacity})), white`
          : "white",
      }}
      aria-label={hasCheckIn ? `選擇 ${item.date} 的打卡記錄` : `${item.date} 尚未打卡`}
    >
      <span className="relative z-10">{index + 1}</span>
    </Button>
  );
};
