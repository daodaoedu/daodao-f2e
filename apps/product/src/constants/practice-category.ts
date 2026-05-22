import { ArtSvg, HealthSvg, LanguageSvg, LifeSvg, TechSvg } from "@daodao/assets";

/**
 * 實踐模板分類列表
 */
export const practiceCategories = [
  "digital_skill",
  "lifestyle",
  "art_design",
  "language",
  "wellness",
] as const;

/**
 * 實踐模板分類的 metadata 映射
 * 將 API 返回的分類 ID 對應到顯示用的 label 和 icon
 */
export const practiceCategoryMetadataMap: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  digital_skill: { label: "practice_category_digital_skill", icon: TechSvg },
  lifestyle: { label: "practice_category_lifestyle", icon: LifeSvg },
  art_design: { label: "practice_category_art_design", icon: ArtSvg },
  language: { label: "practice_category_language", icon: LanguageSvg },
  wellness: { label: "practice_category_wellness", icon: HealthSvg },
} as const;
