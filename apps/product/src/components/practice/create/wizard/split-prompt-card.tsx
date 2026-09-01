"use client";

import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";

export interface SplitPromptCardProps {
  days: number;
  onAccept: () => void;
  onReject: () => void;
}

/** 拆段詢問卡：天數 > 30 時建議拆成多個實踐（建議、不強制） */
export const SplitPromptCard = ({ days, onAccept, onReject }: SplitPromptCardProps) => {
  const t = useTranslations("practice");

  return (
    <section
      aria-label={t("wizard_split_title", { days })}
      className="rounded-lg border border-logo-cyan bg-light-blue p-4 space-y-3"
    >
      <p className="text-base font-medium text-text-dark">{t("wizard_split_title", { days })}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button type="button" onClick={onAccept} className="w-full">
          {t("wizard_split_yes")}
        </Button>
        <Button type="button" variant="outline" onClick={onReject} className="w-full">
          {t("wizard_split_no")}
        </Button>
      </div>
    </section>
  );
};
