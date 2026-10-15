"use client";

import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";

export interface SplitPromptCardProps {
  days: number;
  onAccept: () => void;
  onReject: () => void;
}

/** 拆段詢問卡：天數 > 30 時建議拆成多個實踐（建議、不強制）。POC：淡青底、淡藍框、radius 12、兩鈕並排 */
export const SplitPromptCard = ({ days, onAccept, onReject }: SplitPromptCardProps) => {
  const t = useTranslations("practice");

  return (
    <section
      aria-label={t("wizard_split_title", { days })}
      className="rounded-[12px] border border-blue bg-light-blue p-4"
    >
      <p className="mb-3 text-base font-medium leading-normal text-text-dark">
        {t("wizard_split_title", { days })}
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          onClick={onAccept}
          className="h-auto min-h-11 flex-1 px-3 py-2 text-[15px]"
        >
          {t("wizard_split_yes")}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onReject}
          className="h-auto min-h-11 flex-1 px-3 py-2 text-[15px]"
        >
          {t("wizard_split_no")}
        </Button>
      </div>
    </section>
  );
};
