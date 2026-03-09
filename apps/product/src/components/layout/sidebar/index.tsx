"use client";

import { useAuth, useAuthContext } from "@daodao/auth";
import { getEnv } from "@daodao/config";
import { useIsMobile } from "@daodao/shared";
import { DesktopSidebar } from "./desktop";
import { MobileSidebar } from "./mobile";

export function Sidebar() {
  const { isAuthenticated } = useAuthContext();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const debugMode = getEnv("NEXT_PUBLIC_DEBUG_MODE") === "true";
  const identifier = user?.customId ?? user?.id ?? (debugMode ? "enn" : "");

  if (!isAuthenticated && !debugMode) {
    return null;
  }

  if (isMobile) {
    return <MobileSidebar identifier={identifier} />;
  }
  return <DesktopSidebar identifier={identifier} />;
}
