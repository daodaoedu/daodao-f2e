"use client";

import { Button } from "@daodao/ui/components/button";
import { cn } from "@daodao/ui/lib/utils";
import { MOOD_OPTIONS } from "@/constants/mood";
import type { ICheckInDate, ICheckInDisplayData } from "../types";

interface ICheckInDateButtonProps {
  item: ICheckInDate;
  index: number;
  checkIns: Record<string, ICheckInDisplayData>;
  activeCheckInId: string;
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
  onSelect,
  className,
}: ICheckInDateButtonProps) => {
  const hasCheckIn = item.hasCheckIn ?? !!checkIns[item.id];
  const isActive = hasCheckIn && item.id === activeCheckInId;
  const itemCheckIn = checkIns[item.id];
  const itemMood = itemCheckIn?.mood;
  const itemMoodOption = itemMood ? MOOD_OPTIONS.find((option) => option.id === itemMood) : null;
  const ItemMoodEmoji = itemMoodOption?.emoji;

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
      {ItemMoodEmoji && <ItemMoodEmoji className="absolute top-0 right-0 size-4" />}
      <span className="relative z-10">{index + 1}</span>
    </Button>
  );
};
