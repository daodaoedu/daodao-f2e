"use client";

import { useTranslations } from "@daodao/i18n";
import { Mail } from "lucide-react";

interface Day1LetterRevealProps {
  firstNote?: string | null;
  lastNote?: string | null;
}

export function Day1LetterReveal({ firstNote, lastNote }: Day1LetterRevealProps) {
  const t = useTranslations("learning_harness");

  if (!firstNote) return null;

  return (
    <div className="bg-gradient-to-br from-white to-[#E6FBF8] rounded-xl p-4 border border-[#C1ECFF]">
      <div className="flex items-center gap-2 mb-3">
        <Mail className="size-4 text-logo-cyan" />
        <p className="text-sm font-medium text-text-dark">{t("j_d15_day1_recall_label")}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] text-light-gray mb-1">{t("growth_map_day1_message_title")}</p>
          <p className="text-xs text-text-dark italic line-clamp-3">「{firstNote}」</p>
        </div>
        {lastNote && lastNote !== firstNote && (
          <div>
            <p className="text-[10px] text-logo-cyan mb-1">最後一次反思</p>
            <p className="text-xs text-text-dark italic line-clamp-3">「{lastNote}」</p>
          </div>
        )}
      </div>
    </div>
  );
}
