"use client";

import { cn } from "@daodao/ui/lib/utils";
import { useState } from "react";
import { useLayoutGuest } from "./session-hint";
import { Sidebar } from "./sidebar";

export function WithLayoutFrame({
  children,
  className,
  showSidebarForGuests = false,
}: {
  children: React.ReactNode;
  className?: string;
  showSidebarForGuests?: boolean;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  // 確定是訪客時不留側欄空位（daodao#567）；判斷方式見 useLayoutGuest
  const isGuest = useLayoutGuest();
  const reserveSidebar = showSidebarForGuests || !isGuest;

  return (
    <>
      <div
        data-sidebar-collapsed={isSidebarCollapsed}
        className={cn(
          "transition-[padding-left] duration-300",
          // 側欄寬度與置中偏移給框內 fixed 元素用（md: 才吃）；訪客沒有側欄時為 0，否則 fixed 元素會偏右
          !reserveSidebar && "[--sidebar-center-offset:0px] [--sidebar-width:0px]",
          reserveSidebar &&
            (isSidebarCollapsed
              ? "[--sidebar-center-offset:34px] [--sidebar-width:68px] md:pl-[68px]"
              : "[--sidebar-center-offset:72px] [--sidebar-width:144px] md:pl-[144px]"),
          className
        )}
      >
        {children}
      </div>
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleSidebar={() => setIsSidebarCollapsed((collapsed) => !collapsed)}
        showForGuests={showSidebarForGuests}
      />
    </>
  );
}
