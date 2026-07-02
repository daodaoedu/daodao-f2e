"use client";

import { cn } from "@daodao/ui/lib/utils";
import { Award, Bike, BookOpen, GraduationCap, Target } from "lucide-react";
import type { ChallengeCategory } from "./types";

/** 依設計稿的品牌色系，每個分類一組主色 + 淡色底 */
const CATEGORY_STYLES: Record<
  ChallengeCategory,
  { icon: typeof Target; color: string; bg: string }
> = {
  exam: { icon: GraduationCap, color: "#16B9B3", bg: "#E8F8F7" },
  book: { icon: BookOpen, color: "#FFA10B", bg: "#FFF4E3" },
  sport: { icon: Bike, color: "#7BA428", bg: "#F3F8E3" },
  certification: { icon: Award, color: "#D9A606", bg: "#FDF6DC" },
  other: { icon: Target, color: "#E86B2A", bg: "#FDEFE7" },
};

export function getCategoryStyle(category: ChallengeCategory) {
  return CATEGORY_STYLES[category] ?? CATEGORY_STYLES.other;
}

interface CategoryIconTileProps {
  category: ChallengeCategory;
  className?: string;
  iconClassName?: string;
}

/** 挑戰分類的封面圖示方塊（正式版將由挑戰封面圖取代） */
export function CategoryIconTile({ category, className, iconClassName }: CategoryIconTileProps) {
  const style = getCategoryStyle(category);
  const Icon = style.icon;
  return (
    <div
      className={cn("flex shrink-0 items-center justify-center rounded-xl", className)}
      style={{ backgroundColor: style.bg }}
    >
      <Icon className={iconClassName} style={{ color: style.color }} />
    </div>
  );
}
