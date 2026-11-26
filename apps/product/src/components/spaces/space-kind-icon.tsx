import type { SpaceListItemType } from "@daodao/api";
import { cn } from "@daodao/ui/lib/utils";

/** Card tint/accent pairs per space kind, matching the POC palette. */
export const SPACE_KIND_STYLES = {
  personal: { tint: "bg-[oklch(0.93_0.012_210)]", accent: "bg-basic-600" },
  challenge: { tint: "bg-[oklch(0.945_0.045_195)]", accent: "bg-primary-base" },
  event_course: { tint: "bg-[oklch(0.95_0.045_80)]", accent: "bg-logo-orange" },
} as const satisfies Record<SpaceListItemType["kind"], { tint: string; accent: string }>;

const SIZES = {
  /** 空間清單卡片 */
  card: { tile: "size-11 rounded-[14px]", bar: "mb-[11px] h-[13px] w-[26px]" },
  /** 頁首標題旁（與探索頁旗子圖示同高） */
  header: { tile: "size-8 rounded-[10px]", bar: "mb-2 h-[9px] w-[18px]" },
} as const;

interface SpaceKindIconProps {
  kind: SpaceListItemType["kind"];
  size?: keyof typeof SIZES;
}

/** 空間種類色塊（半圓島嶼）：清單卡片與空間頁頁首共用 */
export const SpaceKindIcon = ({ kind, size = "card" }: SpaceKindIconProps) => {
  const styles = SPACE_KIND_STYLES[kind];
  const sizes = SIZES[size];
  return (
    <span
      aria-hidden="true"
      className={cn("flex shrink-0 items-end justify-center", sizes.tile, styles.tint)}
    >
      <span className={cn("block rounded-t-full", sizes.bar, styles.accent)} />
    </span>
  );
};
