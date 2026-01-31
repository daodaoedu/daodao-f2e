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
  digital_skill: { label: "數位技能", icon: TechSvg },
  lifestyle: { label: "生活品味", icon: LifeSvg },
  art_design: { label: "藝術與設計", icon: ArtSvg },
  language: { label: "語言", icon: LanguageSvg },
  wellness: { label: "身心健康", icon: HealthSvg },
} as const;
