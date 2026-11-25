"use client";

import { cn } from "@daodao/ui/lib/utils";
import { type CSSProperties, useState } from "react";
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

  return (
    // 側欄空位只在側邊導覽真的有畫出東西時才留（:has 判斷），訪客看不到側欄時不留 144px 空白（daodao#567）。
    // 用 CSS 判斷而不是讀登入狀態，避免 SSR 與 client 首次渲染不一致造成 hydration mismatch。
    <div className="group/frame">
      <div
        data-sidebar-collapsed={isSidebarCollapsed}
        style={
          {
            "--sidebar-center-offset": isSidebarCollapsed ? "34px" : "72px",
            // Fixed bars inside the frame start after the desktop sidebar (md+) instead of under it.
            "--sidebar-width": isSidebarCollapsed ? "68px" : "144px",
          } as CSSProperties
        }
        className={cn(
          "transition-[padding-left] duration-300",
          isSidebarCollapsed
            ? "md:group-has-[[data-frame-sidebar]>*]/frame:pl-[68px]"
            : "md:group-has-[[data-frame-sidebar]>*]/frame:pl-[144px]",
          className
        )}
      >
        {children}
      </div>
      <div data-frame-sidebar className="contents">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed((collapsed) => !collapsed)}
          showForGuests={showSidebarForGuests}
        />
      </div>
    </div>
  );
}
