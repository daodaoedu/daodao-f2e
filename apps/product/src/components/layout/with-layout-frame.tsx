"use client";

import { useState, type CSSProperties } from "react";
import { cn } from "@daodao/ui/lib/utils";
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
    <>
      <div
        data-sidebar-collapsed={isSidebarCollapsed}
        style={
          {
            "--sidebar-center-offset": isSidebarCollapsed ? "34px" : "72px",
          } as CSSProperties
        }
        className={cn(
          "transition-[padding-left] duration-300",
          isSidebarCollapsed ? "md:pl-[68px]" : "md:pl-[144px]",
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
