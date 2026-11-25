"use client";

import { cn } from "@daodao/ui/lib/utils";
import { useState } from "react";
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
        className={cn(
          // 側欄寬度與置中偏移給框內 fixed 元素用（md: 才吃）；沒有側欄時都是 0，否則 fixed 元素會偏右
          "transition-[padding-left] duration-300 [--sidebar-center-offset:0px] [--sidebar-width:0px]",
          isSidebarCollapsed
            ? "group-has-[[data-frame-sidebar]>*]/frame:[--sidebar-center-offset:34px] group-has-[[data-frame-sidebar]>*]/frame:[--sidebar-width:68px] md:group-has-[[data-frame-sidebar]>*]/frame:pl-[68px]"
            : "group-has-[[data-frame-sidebar]>*]/frame:[--sidebar-center-offset:72px] group-has-[[data-frame-sidebar]>*]/frame:[--sidebar-width:144px] md:group-has-[[data-frame-sidebar]>*]/frame:pl-[144px]",
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
