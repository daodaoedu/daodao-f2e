"use client";

import { Button } from "@daodao/ui/components/button";
import { cn } from "@daodao/ui/lib/utils";
import { MOOD_OPTIONS } from "@/constants/mood";
import type { CheckInDate, CheckInData } from "./types";

interface CheckInDateButtonProps {
  item: CheckInDate;
  index: number;
  checkIns: Record<string, CheckInData>;
  activeCheckInId: string;
  onSelect: (checkInId: string) => void;
  className?: string;
}

export const CheckInDateButton = ({
  item,
  index,
  checkIns,
  activeCheckInId,
  onSelect,
  className,
}: CheckInDateButtonProps) => {
  const hasCheckIn = item.hasCheckIn ?? !!checkIns[item.id];
  const isActive = hasCheckIn && item.id === activeCheckInId;
  const itemCheckIn = checkIns[item.id];
  const itemMood = itemCheckIn?.mood;
  const itemMoodOption = itemMood
    ? MOOD_OPTIONS.find((option) => option.id === itemMood)
    : null;
  const ItemMoodEmoji = itemMoodOption?.emoji;

  return (
    <Button
      key={item.id}
      onClick={() => {
        if (hasCheckIn) {
          onSelect(item.id);
        }
      }}
      variant={isActive ? "orange" : "white"}
      disabled={!hasCheckIn}
      className={cn(
        "relative size-12 shrink-0",
        isActive ? "text-white pointer-events-none" : "text-logo-cyan",
        !hasCheckIn && "opacity-30 cursor-not-allowed",
        className
      )}
      aria-label={
        hasCheckIn
          ? `選擇 ${item.date} 的打卡記錄`
          : `${item.date} 尚未打卡`
      }
    >
      {ItemMoodEmoji && (
        <ItemMoodEmoji className="absolute top-0 right-0 size-4" />
      )}
      <span>{index + 1}</span>
    </Button>
  );
};

