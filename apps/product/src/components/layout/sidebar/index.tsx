"use client";

import { useCurrentUser } from "@daodao/api";
import { useAuthContext } from "@daodao/auth";
import { useIsMobile } from "@daodao/shared";
import { DesktopSidebar } from "./desktop";
import { MobileSidebar } from "./mobile";

export function Sidebar() {
  const { isAuthenticated, user: authUser } = useAuthContext();
  const isMobile = useIsMobile();
  const { data: currentUserData } = useCurrentUser();
  // /api/v1/auth/me 不回傳 customId，需從 /api/v1/users/me 取得
  const userData = currentUserData?.data;
  const identifier = userData?.customId ?? authUser?.id ?? "";
  const userName = userData?.name ?? "";
  const photoURL = userData?.photoURL ?? "";

  if (!isAuthenticated) {
    return null;
  }

  if (isMobile) {
    return <MobileSidebar identifier={identifier} userName={userName} photoURL={photoURL} />;
  }
  return <DesktopSidebar identifier={identifier} userName={userName} photoURL={photoURL} />;
}
