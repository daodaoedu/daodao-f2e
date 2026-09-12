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

/** 預設時區；實際顯示以 API 回傳的組織時區（data.range.timezone）為準 */
export const DEFAULT_ACTIVITY_TIMEZONE = "Asia/Taipei";

export function formatActivityDateTime(
  value: string,
  timeZone = DEFAULT_ACTIVITY_TIMEZONE
): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${formatActivityDate(value, timeZone)} ${formatActivityTime(value, timeZone)}`;
}

export function formatActivityDate(value: string, timeZone = DEFAULT_ACTIVITY_TIMEZONE): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("zh-TW", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function formatActivityTime(value: string, timeZone = DEFAULT_ACTIVITY_TIMEZONE): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("zh-TW", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}
