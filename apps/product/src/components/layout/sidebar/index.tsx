"use client";

import { useCurrentUser } from "@daodao/api";
import { useAuthContext } from "@daodao/auth";
import { useIsMobile } from "@daodao/shared";
import { DesktopSidebar } from "./desktop";
import { MobileSidebar } from "./mobile";
import type { DesktopSidebarState } from "./type";

export function Sidebar({ isCollapsed, onToggleSidebar, showForGuests = false }: DesktopSidebarState) {
  const { isAuthenticated, user: authUser } = useAuthContext();
  const isMobile = useIsMobile();
  const { data: currentUserData } = useCurrentUser();
  // /api/v1/auth/me 不回傳 customId，需從 /api/v1/users/me 取得
  const identifier = currentUserData?.data?.customId ?? authUser?.id ?? "";

  if (!isAuthenticated && !showForGuests) {
    return null;
  }

  if (isMobile) {
    return <MobileSidebar identifier={identifier} />;
  }
  return (
    <DesktopSidebar
      identifier={identifier}
      isCollapsed={isCollapsed}
      onToggleSidebar={onToggleSidebar}
    />
  );
}
