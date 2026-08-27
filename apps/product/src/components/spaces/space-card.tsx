"use client";

import type { SpaceListItemType } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { Link } from "@daodao/i18n/navigation";
import { cn } from "@daodao/ui/lib/utils";
import { ChevronRight } from "lucide-react";

/** Card tint/accent pairs per space kind, matching the POC palette. */
const KIND_STYLES = {
  personal: { tint: "bg-[oklch(0.93_0.012_210)]", accent: "bg-basic-600" },
  challenge: { tint: "bg-[oklch(0.945_0.045_195)]", accent: "bg-primary-base" },
  event_course: { tint: "bg-[oklch(0.95_0.045_80)]", accent: "bg-logo-orange" },
} as const;

interface SpaceCardProps {
  space: SpaceListItemType;
}

/** One row on the space list (FR-2.x): icon, name/host, state or member stack. */
export const SpaceCard = ({ space }: SpaceCardProps) => {
  const t = useTranslations("space");
  const styles = KIND_STYLES[space.kind];
  const href =
    space.kind === "personal"
      ? "/spaces/personal"
      : space.kind === "challenge"
        ? "/spaces/challenge"
        : `/spaces/${space.id}`;

  return (
    <li>
      <Link
        href={href}
        className="flex items-center gap-3.5 rounded-[18px] border border-[#DCEBEA] bg-white px-4 py-3.5 shadow-[0_2px_6px_rgba(15,48,54,0.04)] transition-all hover:border-primary-base/55 hover:shadow-[0_8px_20px_rgba(15,48,54,0.09)]"
      >
        <span
          className={cn(
            "flex size-11 shrink-0 items-end justify-center rounded-[14px]",
            styles.tint
          )}
        >
          <span className={cn("mb-[11px] block h-[13px] w-[26px] rounded-t-full", styles.accent)} />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
          <span className="truncate text-[17px] font-semibold text-basic-600">{space.name}</span>
          <span className="text-[13px] text-text-dark">{space.host}</span>
        </span>
        <span className="flex shrink-0 items-center gap-2.5">
          {/* 個人實踐/共同挑戰卡才顯示呼吸點；否則留白，不用警示視覺（FR-2.4） */}
          {space.kind !== "event_course" && space.hasActivePractice && (
            <span
              role="img"
              title={t("has_active_practice")}
              aria-label={t("has_active_practice")}
              className="inline-flex size-[26px] items-center justify-center rounded-full bg-primary-base/12"
            >
              <span className="block size-[9px] animate-breathe rounded-full bg-primary-base shadow-[0_0_0_4px_oklch(0.711_0.12_190.6_/_0.18)]" />
            </span>
          )}
          {space.kind === "event_course" && (
            <span
              role="img"
              aria-label={t("members_label", { count: space.memberCount })}
              title={t("members_label", { count: space.memberCount })}
              className="inline-flex items-center gap-2"
            >
              <span
                className={cn(
                  "inline-flex h-6 min-w-6 items-center justify-center rounded-full px-[7px] text-xs font-bold text-basic-600",
                  styles.tint
                )}
              >
                {space.memberCount}
              </span>
              <span className="inline-flex items-center">
                {space.memberAvatars.map((member, index) => (
                  <span
                    key={`${member.nickname}-${index}`}
                    className={cn(
                      "inline-flex size-[26px] items-center justify-center overflow-hidden rounded-full border-2 border-white text-[11px] font-bold text-basic-600",
                      styles.tint,
                      index > 0 && "-ml-2"
                    )}
                  >
                    {member.avatar ? (
                      <img
                        src={member.avatar}
                        alt={member.nickname ?? ""}
                        className="size-full object-cover"
                      />
                    ) : (
                      (member.nickname ?? "?").slice(0, 1)
                    )}
                  </span>
                ))}
              </span>
            </span>
          )}
          <ChevronRight className="size-[18px] text-text-dark/30" />
        </span>
      </Link>
    </li>
  );
};
