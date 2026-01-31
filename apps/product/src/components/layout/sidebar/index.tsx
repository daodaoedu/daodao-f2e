"use client";

import { useAuth, useAuthContext } from "@daodao/auth";
import { useIsMobile } from "@daodao/shared";
import { DesktopSidebar } from "./desktop";
import { MobileSidebar } from "./mobile";

export function Sidebar() {
  const { isAuthenticated } = useAuthContext();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const identifier = user?.customId ?? user?.id ?? "";

  if (!isAuthenticated) {
    return null;
  }

  if (isMobile) {
    return <MobileSidebar identifier={identifier} />;
  }
  return <DesktopSidebar identifier={identifier} />;
}
