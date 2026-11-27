import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface ExploreSectionHeaderProps {
  title: string;
  count: number;
  Icon: LucideIcon;
  /** 已結束區用淡色圖示 */
  muted?: boolean;
  subtitle?: string | null;
}

/** 清單分區標題：圖示＋標題＋「· n」＋可選副標（探索頁 daodao#567、空間頁 daodao#572 共用） */
export function ExploreSectionHeader({
  title,
  count,
  Icon,
  muted = false,
  subtitle,
}: ExploreSectionHeaderProps) {
  return (
    <>
      <div className="flex items-center gap-2">
        <Icon
          className={muted ? "size-4.5 text-text-dark/55" : "size-4.5 text-logo-cyan"}
          aria-hidden="true"
        />
        <h2 className="m-0 text-lg font-bold text-bg-dark">{title}</h2>
        <span className="text-sm text-text-dark/40">· {count}</span>
      </div>
      {subtitle && <p className="mt-1.5 ml-6.5 text-sm text-text-dark/70">{subtitle}</p>}
    </>
  );
}

interface ExploreSectionProps extends ExploreSectionHeaderProps {
  children: ReactNode;
}

/** 探索頁清單分區：分區標題＋卡片兩欄（daodao#567） */
export function ExploreSection({ children, ...header }: ExploreSectionProps) {
  return (
    <section>
      <ExploreSectionHeader {...header} />
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}
