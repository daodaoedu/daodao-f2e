"use client";

import { BellOutlineSvg, BellSolidSvg } from "@daodao/assets";
import { cn } from "@daodao/ui/lib/utils";
import { useUnreadNotificationCount } from "@/hooks/use-notifications";

interface NotificationBellProps {
  isActive: boolean;
  className?: string;
}

export function NotificationBell({ isActive, className }: NotificationBellProps) {
  const unreadCount = useUnreadNotificationCount();
  const Icon = isActive ? BellSolidSvg : BellOutlineSvg;
  const displayCount = unreadCount > 99 ? "99+" : unreadCount > 0 ? String(unreadCount) : null;

  return (
    <span className={cn("relative inline-flex", className)}>
      <Icon
        className={cn(
          "shrink-0 size-9 text-light-gray transition-colors",
          isActive && "text-logo-cyan"
        )}
      />
      {displayCount && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#FF6E0B] text-white text-[10px] font-bold leading-[18px] text-center">
          {displayCount}
        </span>
      )}
    </span>
  );
}
