"use client";

import { useCurrentUser } from "@daodao/api";
import { useAuthContext } from "@daodao/auth";
import { useSearchParams } from "@daodao/i18n/navigation";
import { useIsMobile } from "@daodao/shared";
import { DesktopSidebar } from "./desktop";
import { MobileSidebar } from "./mobile";

export function Sidebar() {
  const { isAuthenticated, user: authUser } = useAuthContext();
  const isMobile = useIsMobile();
  const searchParams = useSearchParams();
  const { data: currentUserData } = useCurrentUser();
  // /api/v1/auth/me 不回傳 customId，需從 /api/v1/users/me 取得
  const identifier = currentUserData?.data?.customId ?? authUser?.id ?? "";
  const showDesktopPreview =
    process.env.NODE_ENV === "development" && searchParams.get("sidebarPreview") === "desktop";

  if (!isAuthenticated && !showDesktopPreview) {
    return null;
  }

  if (showDesktopPreview) {
    return <DesktopSidebar identifier={identifier} />;
  }

  if (isMobile) {
    return <MobileSidebar identifier={identifier} />;
  }
  return <DesktopSidebar identifier={identifier} />;
}
