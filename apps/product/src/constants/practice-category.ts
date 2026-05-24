import { ArtSvg, HealthSvg, LanguageSvg, LifeSvg, TechSvg } from "@daodao/assets";

type CategoryIcon = React.ComponentType<{ className?: string }>;

export const practiceCategoryMetadataMap: Record<string, { labelKey: string; icon: CategoryIcon }> =
  {
    language: { labelKey: "categories.language", icon: LanguageSvg },
    lifestyle: { labelKey: "categories.lifestyle", icon: LifeSvg },
    digital_skill: { labelKey: "categories.digital_skill", icon: TechSvg },
    art_design: { labelKey: "categories.art_design", icon: ArtSvg },
    wellness: { labelKey: "categories.wellness", icon: HealthSvg },
  };
