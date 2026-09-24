import type { ReactNode } from "react";
import { BackgroundAnimation } from "./background-animation";
import { PageHeader, type PageHeaderProps } from "./page-header";
import { pageShellMainClassName, pageShellWrapperClassName } from "./page-shell.styles";

export type PageShellProps = {
  /** 預設頁首：傳入 PageHeader 的 props；要自訂頁首時改用 `header` */
  headerProps?: PageHeaderProps;
  /** 自訂頁首節點，優先於 `headerProps`（例：個人頁的 IslandHeader） */
  header?: ReactNode;
  /** 是否渲染背景動畫，預設 true */
  background?: boolean;
  /** 疊加在 wrapper 上的 className（例：個人頁的底色） */
  className?: string;
  /** 疊加在 main 上的 className（覆寫 max-w／padding） */
  mainClassName?: string;
  children: ReactNode;
};

/**
 * `(with-layout)` 頁面的共用外殼：wrapper + 頁首 + 背景 + `main`。
 *
 * 這一層存在的理由是 daodao#233：同一串 wrapper class 被複製到 15 個 page.tsx，
 * 其中的 `w-screen` 疊上 layout 的 `md:pl-[132px]` 讓每頁右偏 132px，改一處等於改十五處。
 * 新頁面一律透過本元件取得 wrapper，不要再手寫。
 */
export const PageShell = ({
  headerProps,
  header,
  background = true,
  className,
  mainClassName,
  children,
}: PageShellProps) => (
  <div className={pageShellWrapperClassName(className)}>
    {header ?? (headerProps ? <PageHeader {...headerProps} /> : null)}

    {background && <BackgroundAnimation />}

    <main className={pageShellMainClassName(mainClassName)}>{children}</main>
  </div>
);
