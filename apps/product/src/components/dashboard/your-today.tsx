"use client";

import { useMyPractices } from "@daodao/api";
import { useAuth } from "@daodao/auth";
import { useTranslations } from "@daodao/i18n";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { cn } from "@daodao/ui/lib/utils";
import { ChevronDown, ChevronRight, ChevronUp } from "lucide-react";
import { useMemo, useState } from "react";

function getGreetingKey(): "greeting_morning" | "greeting_afternoon" | "greeting_evening" {
  const hour = new Date().getHours();
  if (hour < 11) return "greeting_morning";
  if (hour < 18) return "greeting_afternoon";
  return "greeting_evening";
}

interface PracticeCard {
  id: string;
  title: string;
  type: "personal" | "challenge";
  currentDays: number;
  totalDays: number;
  lastCheckInDate: string | null;
}

export function YourToday() {
  const t = useTranslations("dashboard");
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(true);
  const { data: practicesData } = useMyPractices({ limit: 20 });

  const cards = useMemo<PracticeCard[]>(() => {
    const practices = practicesData?.data ?? [];
    return practices
      .filter((p) => p.status === "active")
      .map((p) => {
        const startDate = p.startDate ? new Date(p.startDate) : new Date();
        const endDate = p.endDate ? new Date(p.endDate) : new Date();
        const totalDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000));
        return {
          id: p.id,
          title: p.title,
          type: "personal" as "personal" | "challenge",
          currentDays: p.checkInCount ?? 0,
          totalDays,
          lastCheckInDate: p.lastCheckinAt ?? null,
        };
      });
  }, [practicesData]);

  const displayName = user?.name ?? "";
  const greetingKey = getGreetingKey();

  if (!user) return null;

  return (
    <section className="mb-4">
      {isExpanded ? (
        <>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-text-dark">
              {t(greetingKey, { name: displayName })}
            </h2>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="size-[26px] flex items-center justify-center rounded-full hover:bg-black/5 transition-colors"
              aria-label="收合"
            >
              <ChevronUp className="size-[15px] text-text-dark/40" />
            </button>
          </div>

          {cards.length > 0 ? (
            <div className="flex flex-wrap gap-[10px]">
              {cards.map((card) => (
                <CustomLink
                  key={card.id}
                  href={`/practices/${card.id}`}
                  className="flex items-center gap-3 px-4 py-[14px] rounded-[18px] hover:bg-white/50 transition-colors group"
                >
                  <span className={cn(
                    "shrink-0 flex items-center justify-center size-6 rounded-full",
                    card.type === "challenge" ? "bg-logo-cyan/10 text-logo-cyan" : "bg-text-dark/10 text-text-dark"
                  )}>
                    {card.type === "challenge" ? (
                      <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
                    ) : (
                      <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    )}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-dark truncate">{card.title}</p>
                    <p className="text-[11px] text-text-dark/40">
                      {card.lastCheckInDate
                        ? t("your_today_days_progress", { current: card.currentDays, total: card.totalDays })
                        : t("your_today_first_checkin")}
                    </p>
                  </div>
                  <ChevronRight className="size-[18px] text-text-dark/20 group-hover:text-text-dark/40 transition-colors" />
                </CustomLink>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-dark/40 py-3">{t("your_today_empty")}</p>
          )}
        </>
      ) : (
        <div className="flex items-center gap-3 pb-3 border-b border-[#E3EFEE]">
          <h2 className="text-base font-semibold text-text-dark">
            {t(greetingKey, { name: displayName })}
          </h2>
          {cards.length > 0 && (
            <span className="text-sm text-text-dark/40">
              {t("your_today_collapsed", { count: cards.length })}
            </span>
          )}
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="ml-auto flex items-center gap-1 text-sm text-logo-cyan hover:underline"
          >
            {t("your_today_expand")}
            <ChevronDown className="size-3.5" />
          </button>
        </div>
      )}
    </section>
  );
}
