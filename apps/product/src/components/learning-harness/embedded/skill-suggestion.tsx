"use client";

import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { Lightbulb } from "lucide-react";

interface SkillSuggestionProps {
  tags?: string[];
}

const TAG_SKILL_MAP: Record<string, { titleKey: string; descKey: string; tipKey: string }> = {
  閱讀: {
    titleKey: "skill_cornell_title",
    descKey: "skill_cornell_desc",
    tipKey: "skill_cornell_tip",
  },
  學習理論: {
    titleKey: "skill_cornell_title",
    descKey: "skill_cornell_desc",
    tipKey: "skill_cornell_tip",
  },
};

export function SkillSuggestion({ tags }: SkillSuggestionProps) {
  const t = useTranslations("learning_harness");

  const matchedSkill = tags?.find((tag) => TAG_SKILL_MAP[tag]);
  if (!matchedSkill) return null;

  const skill = TAG_SKILL_MAP[matchedSkill]!;

  return (
    <div className="bg-white rounded-xl p-4 border border-[#C1ECFF]">
      <div className="flex items-start gap-3">
        <Lightbulb className="size-4 text-logo-cyan shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-text-dark mb-1">{t(skill.titleKey)}</p>
          <p className="text-xs text-text-dark leading-relaxed mb-2">{t(skill.descKey)}</p>
          <div className="bg-[#E6FBF8] rounded-lg p-2 mb-2">
            <p className="text-xs text-logo-cyan">{t(skill.tipKey)}</p>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" size="sm" className="text-xs h-7">
              {t("skill_dismiss")}
            </Button>
            <Button type="button" variant="orange" size="sm" className="text-xs h-7">
              {t("skill_try")}
            </Button>
          </div>
          <p className="text-[10px] text-light-gray mt-2 italic">{t("skill_source")}</p>
        </div>
      </div>
    </div>
  );
}
