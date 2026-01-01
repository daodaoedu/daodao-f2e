"use client";

import { DesktopSidebar } from "./desktop";
import { MobileSidebar } from "./mobile";

export function Sidebar() {
  return (
    <>
      <div className="md:hidden">
        <MobileSidebar />
      </div>
      <div className="hidden md:block">
        <DesktopSidebar />
      </div>
    </>
  );
}
