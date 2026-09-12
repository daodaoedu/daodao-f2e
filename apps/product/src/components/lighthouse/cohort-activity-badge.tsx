"use client";

import type { LighthouseActivityItem } from "@daodao/api";
import { cn } from "@daodao/ui/lib/utils";

/** 類型膠囊配色（原型 tone）：打卡 teal、留言／回應 mint、節奏變化 amber */
const TONES: Record<LighthouseActivityItem["type"], string> = {
  checkin: "bg-[#E7FAF7] text-[#0D5B59]",
  comment: "bg-[#F0FBF9] text-[#0D5B59]",
  rhythm: "bg-[#FFF1D8] text-[#A95D00]",
};

export function ActivityTypeBadge({
  item,
  className,
}: {
  item: Pick<LighthouseActivityItem, "type" | "typeLabel">;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        TONES[item.type],
        className
      )}
    >
      {item.typeLabel}
    </span>
  );
}

export function formatActivityDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${formatActivityDate(value)} ${formatActivityTime(value)}`;
}

export function formatActivityDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("zh-TW", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function formatActivityTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("zh-TW", {
    timeZone: "Asia/Taipei",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}
