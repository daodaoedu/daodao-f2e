"use client";

import { Flag } from "lucide-react";
import type { ReactNode } from "react";
import { ExploreGuestHeader } from "@/components/activity/explore-guest-header";
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
 * 背景與首頁同為 very-light-gray，靠左標題＋副標，內容寬 760。
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
    <div className="min-h-screen bg-very-light-gray">
      {showGuestHeader && <ExploreGuestHeader redirect={guestRedirect} />}
      <main
        className={
          // 登入時手機版左上有固定 logo（側邊導覽 mobile），內容要讓開
          showGuestHeader
            ? "mx-auto flex w-full max-w-[760px] flex-col gap-6 px-4 pt-8 pb-18"
            : "mx-auto flex w-full max-w-[760px] flex-col gap-6 px-4 pt-[68px] pb-18 md:pt-8"
        }
      >
        <header className="flex flex-col gap-2">
          <h1 className="m-0 flex items-center gap-2 text-2xl font-bold text-bg-dark">
            <Flag className="size-6 text-logo-cyan" aria-hidden="true" />
            {title}
          </h1>
          <p className="m-0 text-sm text-text-dark">{subtitle}</p>
        </header>
        {children}
      </main>
    </div>
  );
}
