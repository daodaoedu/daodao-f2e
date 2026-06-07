"use client";

import { useTranslations } from "@daodao/i18n";
import { Bell, Flame } from "lucide-react";

interface DailyDigestProps {
  lastPracticeName?: string;
  lastNote?: string | null;
}

export function DailyDigest({ lastPracticeName, lastNote }: DailyDigestProps) {
  const t = useTranslations("learning_harness");

  return (
    <div className="bg-white rounded-xl p-4 border border-[#C1ECFF] mb-4">
      <div className="flex items-center gap-2 mb-2">
        <Bell className="size-4 text-logo-cyan" />
        <span className="text-xs font-medium text-text-dark">{t("hook_notification_title")}</span>
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2 text-xs text-text-dark">
          <Flame className="size-3 text-orange-500 shrink-0" />
          <span>小明打卡了 · 火苗在等你</span>
        </div>
        {lastPracticeName && (
          <p className="text-xs text-light-gray">
            {lastNote
              ? `上次的反思：「${lastNote.slice(0, 30)}${lastNote.length > 30 ? "..." : ""}」`
              : `繼續「${lastPracticeName}」`}
          </p>
        )}
      </div>
    </div>
  );
}
