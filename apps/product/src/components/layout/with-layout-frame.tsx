"use client";

import { useAuthContext } from "@daodao/auth";
import { cn } from "@daodao/ui/lib/utils";
import { useEffect, useState } from "react";
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
  const { isAuthenticated, isLoading } = useAuthContext();
  // 確定是訪客（看不到側邊導覽）才拿掉側欄空位，避免左側留 144px 空白（daodao#567）。
  // 預設保留空位、mount 後才依登入結果更新：SSR 與 client 首次渲染一致不會 hydration mismatch，
  // 登入使用者也不會在側欄出現時被往右推。
  const [isConfirmedGuest, setIsConfirmedGuest] = useState(false);
  useEffect(() => {
    setIsConfirmedGuest(!isLoading && !isAuthenticated && !showSidebarForGuests);
  }, [isLoading, isAuthenticated, showSidebarForGuests]);

  return (
    <>
      <div
        data-sidebar-collapsed={isSidebarCollapsed}
        className={cn(
          "transition-[padding-left] duration-300",
          // 側欄寬度與置中偏移給框內 fixed 元素用（md: 才吃）；訪客沒有側欄時為 0，否則 fixed 元素會偏右
          isConfirmedGuest && "[--sidebar-center-offset:0px] [--sidebar-width:0px]",
          !isConfirmedGuest &&
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
