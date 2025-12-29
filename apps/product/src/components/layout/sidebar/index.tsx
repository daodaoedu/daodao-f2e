"use client";

import { useIsMobile } from "@daodao/shared";
import { DesktopSidebar } from "./desktop";
import { MobileSidebar } from "./mobile";

export function Sidebar() {
  const isMobile = useIsMobile();
  return isMobile ? <MobileSidebar /> : <DesktopSidebar />;
}
