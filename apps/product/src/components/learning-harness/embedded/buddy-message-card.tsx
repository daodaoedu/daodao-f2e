"use client";

import { useTranslations } from "@daodao/i18n";
import { Avatar, AvatarFallback } from "@daodao/ui/components/avatar";

export function BuddyMessageCard() {
  const t = useTranslations("learning_harness");

  return (
    <div className="bg-white rounded-xl p-4 border border-[#C1ECFF] space-y-3">
      <p className="text-xs font-medium text-logo-cyan">{t("buddy_message_title")}</p>
      <div className="flex items-start gap-3">
        <Avatar className="size-8 shrink-0">
          <AvatarFallback className="bg-[#E6FBF8] text-logo-cyan text-xs">明</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="text-[10px] text-light-gray mb-1">小明 · Buddy</p>
          <div className="bg-[#E6FBF8] rounded-xl rounded-tl-none p-3">
            <p className="text-sm text-text-dark leading-relaxed">{t("buddy_message_body")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
