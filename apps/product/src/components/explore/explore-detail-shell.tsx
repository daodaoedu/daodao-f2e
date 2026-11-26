"use client";

import type { ReactNode } from "react";
import { ExploreGuestHeader } from "@/components/activity/explore-guest-header";
import { useLayoutGuest } from "@/components/layout/session-hint";

interface ExploreDetailShellProps {
  /** 訪客登入後要回到的頁面 */
  guestRedirect: string;
  children: ReactNode;
}

/**
 * 探索頁點進去的介紹頁外框（共同挑戰介紹頁，daodao#570）：
 * 背景、訪客頁首、內容寬與探索列表頁（ExplorePageShell）一致，標題由內容自己放。
 */
export function ExploreDetailShell({ guestRedirect, children }: ExploreDetailShellProps) {
  const showGuestHeader = useLayoutGuest();

  return (
    <div className="min-h-screen bg-very-light-gray">
      {showGuestHeader && <ExploreGuestHeader redirect={guestRedirect} />}
      <main
        className={
          // 登入時手機版左上有固定 logo（側邊導覽 mobile），內容要讓開
          showGuestHeader
            ? "mx-auto flex w-full max-w-[760px] flex-col gap-6 px-4 pt-7 pb-18"
            : "mx-auto flex w-full max-w-[760px] flex-col gap-6 px-4 pt-[68px] pb-18 md:pt-8"
        }
      >
        {children}
      </main>
    </div>
  );
}
