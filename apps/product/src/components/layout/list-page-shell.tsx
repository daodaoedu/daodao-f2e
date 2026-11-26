"use client";

import { Link } from "@daodao/i18n/navigation";
import { cn } from "@daodao/ui/lib/utils";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

interface ListPageShellProps {
  title: string;
  subtitle?: ReactNode;
  /** 標題左側圖示（探索頁旗子、空間種類色塊） */
  icon: ReactNode;
  /** 有值時標題左側顯示返回鍵 */
  back?: { href: string; label: string };
  /** 頁首右側（成員頭像等） */
  actions?: ReactNode;
  /** 頁首上方的整條區塊（訪客頁首） */
  topBar?: ReactNode;
  /** 登入時手機版左上有固定 logo（側邊導覽 mobile），內容要讓開；訪客頁首時不用 */
  clearMobileNav?: boolean;
  children: ReactNode;
}

/**
 * 清單型頁面共用外框：首頁同色背景、內容寬 760、靠左圖示＋標題＋副標。
 * 探索頁（daodao#567）與空間頁（daodao#572）共用，兩邊外觀要一致就只改這裡。
 */
export function ListPageShell({
  title,
  subtitle,
  icon,
  back,
  actions,
  topBar,
  clearMobileNav = true,
  children,
}: ListPageShellProps) {
  return (
    <div className="min-h-screen bg-very-light-gray">
      {topBar}
      <main
        className={cn(
          "mx-auto flex w-full max-w-[760px] flex-col gap-6 px-4 pb-18",
          clearMobileNav ? "pt-[68px] md:pt-8" : "pt-8"
        )}
      >
        <header className="flex items-start gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <h1 className="m-0 flex min-w-0 items-center gap-2 text-2xl font-bold text-bg-dark">
              {back && (
                <Link
                  href={back.href}
                  aria-label={back.label}
                  className="-ml-2 inline-flex size-9 shrink-0 items-center justify-center rounded-full text-text-dark transition-colors hover:bg-[#F0F9F8]"
                >
                  <ChevronLeft className="size-5" aria-hidden="true" />
                </Link>
              )}
              {icon}
              <span className="min-w-0 truncate">{title}</span>
            </h1>
            {subtitle && <p className="m-0 text-sm text-text-dark">{subtitle}</p>}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </header>
        {children}
      </main>
    </div>
  );
}
