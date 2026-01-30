import { ArtSvg, HealthSvg, LanguageSvg, LifeSvg, TechSvg } from "@daodao/assets";

/**
 * 實踐模板分類的 metadata 映射
 * 將 API 返回的分類 ID 對應到顯示用的 label 和 icon
 */
export const practiceCategoryMetadataMap: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  language: { label: "語言", icon: LanguageSvg },
  lifestyle: { label: "生活品味", icon: LifeSvg },
  digital: { label: "數位技能", icon: TechSvg },
  art: { label: "藝術與設計", icon: ArtSvg },
  health: { label: "身心健康", icon: HealthSvg },
  reading: { label: "閱讀", icon: LifeSvg },
  learning: { label: "學習", icon: LanguageSvg },
  fitness: { label: "健身", icon: HealthSvg },
  meditation: { label: "冥想", icon: HealthSvg },
  writing: { label: "寫作", icon: ArtSvg },
  coding: { label: "程式設計", icon: TechSvg },
} as const;
