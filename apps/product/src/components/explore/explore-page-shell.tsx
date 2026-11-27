"use client";

import { Flag } from "lucide-react";
import type { ReactNode } from "react";
import { ExploreGuestHeader } from "@/components/activity/explore-guest-header";
import { ListPageShell } from "@/components/layout/list-page-shell";
import { useLayoutGuest } from "@/components/layout/session-hint";

interface ExplorePageShellProps {
  title: string;
  subtitle: string;
  /** 訪客登入後要回到的頁面 */
  guestRedirect: string;
  children: ReactNode;
}

/**
 * 探索頁共用外框（探索共同挑戰、探索活動課程，daodao#567）：
 * 外框與空間頁共用 ListPageShell（daodao#572），這裡只加旗子圖示與訪客頁首。
 */
export function ExplorePageShell({
  title,
  subtitle,
  guestRedirect,
  children,
}: ExplorePageShellProps) {
  // 未登入時顯示訪客頁首（登入／免費加入），登入後由側邊導覽取代；判斷與側欄空位同步（useLayoutGuest）
  const showGuestHeader = useLayoutGuest();

  return (
    <ListPageShell
      title={title}
      subtitle={subtitle}
      icon={<Flag className="size-6 shrink-0 text-logo-cyan" aria-hidden="true" />}
      topBar={showGuestHeader ? <ExploreGuestHeader redirect={guestRedirect} /> : undefined}
      clearMobileNav={!showGuestHeader}
    >
      {children}
    </ListPageShell>
  );
}
