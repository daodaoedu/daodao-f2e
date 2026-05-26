"use client";

import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { Sparkles } from "lucide-react";

interface GuestGuidedStateProps {
  onLogin: () => void;
}

/** 需登入才有資料的區塊：未登入顯示價值說明 + 範例 + 註冊 CTA（不空白） */
export function GuestGuidedState({ onLogin }: GuestGuidedStateProps) {
  const t = useTranslations("roadmap");

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-logo-cyan/40 bg-light-blue/40 px-6 py-10 text-center">
      <Sparkles className="size-8 text-logo-cyan" />
      <h3 className="text-lg font-semibold text-text-dark">{t("guest_title")}</h3>
      <p className="max-w-md text-sm leading-relaxed text-light-gray">{t("guest_desc")}</p>
      <Button type="button" variant="default" onClick={onLogin}>
        {t("guest_cta")}
      </Button>
    </div>
  );
}
