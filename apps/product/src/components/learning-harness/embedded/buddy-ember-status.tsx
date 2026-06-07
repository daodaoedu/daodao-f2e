"use client";

import { useTranslations } from "@daodao/i18n";
import { Avatar, AvatarFallback } from "@daodao/ui/components/avatar";
import { Flame } from "lucide-react";

interface BuddyEmberStatusProps {
  compact?: boolean;
}

export function BuddyEmberStatus({ compact = false }: BuddyEmberStatusProps) {
  const t = useTranslations("learning_harness");

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#E6FBF8]">
        <Flame className="size-4 text-orange-500" />
        <span className="text-xs text-text-dark">{t("s1_ember_status")}</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 border border-[#C1ECFF]">
      <div className="flex items-center gap-3">
        <Avatar className="size-10">
          <AvatarFallback className="bg-[#E6FBF8] text-logo-cyan">明</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="text-sm font-medium text-text-dark">{t("j_d1_buddy_matched")}</p>
          <div className="flex items-center gap-1 mt-1">
            <Flame className="size-3 text-orange-500" />
            <Flame className="size-3 text-orange-500" />
            <span className="text-[10px] text-light-gray">{t("ember_level_2")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
