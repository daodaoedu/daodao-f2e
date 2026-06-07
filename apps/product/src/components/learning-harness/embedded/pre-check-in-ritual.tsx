"use client";

import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { BookOpen, Check, Sparkles } from "lucide-react";

interface PreCheckInRitualProps {
  lastNote?: string | null;
  practiceTitle?: string;
}

export function PreCheckInRitual({ lastNote, practiceTitle }: PreCheckInRitualProps) {
  const t = useTranslations("learning_harness");

  return (
    <div className="mb-6 space-y-3">
      {lastNote && (
        <div className="bg-[#E6FBF8] rounded-xl p-3 border border-[#C1ECFF]">
          <div className="flex items-start gap-2">
            <Sparkles className="size-4 text-logo-cyan shrink-0 mt-0.5" />
            <p className="text-xs text-text-dark italic line-clamp-2">{lastNote}</p>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between bg-very-light-gray rounded-lg px-3 py-2">
        <div className="flex items-center gap-2">
          <BookOpen className="size-4 text-logo-cyan" />
          <span className="text-sm text-text-dark">{t("hook_pre_checkin_method")}</span>
        </div>
        <Button type="button" variant="orange" size="sm" className="text-xs h-7">
          <Check className="size-3" />
          {t("hook_pre_checkin_confirm")}
        </Button>
      </div>
    </div>
  );
}
