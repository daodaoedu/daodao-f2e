import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface ExploreSectionProps {
  title: string;
  count: number;
  Icon: LucideIcon;
  /** 已結束區用淡色圖示 */
  muted?: boolean;
  subtitle?: string | null;
  children: ReactNode;
}

/** 探索頁清單分區：圖示＋標題＋「· n」＋可選副標，卡片兩欄（daodao#567） */
export function ExploreSection({
  title,
  count,
  Icon,
  muted = false,
  subtitle,
  children,
}: ExploreSectionProps) {
  return (
    <section>
      <div className="flex items-center gap-2">
        <Icon
          className={muted ? "size-4.5 text-text-dark/55" : "size-4.5 text-logo-cyan"}
          aria-hidden="true"
        />
        <h2 className="m-0 text-lg font-bold text-bg-dark">{title}</h2>
        <span className="text-sm text-text-dark/40">· {count}</span>
      </div>
      {subtitle && <p className="mt-1.5 ml-6.5 text-sm text-text-dark/70">{subtitle}</p>}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}
