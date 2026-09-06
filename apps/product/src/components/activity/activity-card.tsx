"use client";

import type { ActivitySummaryType } from "@daodao/api";
import { DefaultAvatarSvg } from "@daodao/assets";
import { useTranslations } from "@daodao/i18n";
import { Link } from "@daodao/i18n/navigation";
import { cn } from "@daodao/ui/lib/utils";
import { format, isValid, parseISO } from "date-fns";
import { Calendar, ChevronRight, Globe, MapPin } from "lucide-react";
import { activityColorKey } from "@/constants/activity-color";
import { PracticeTheme, practiceThemeSvgMap } from "@/constants/practice-theme";

interface ActivityCardProps {
  activity: ActivitySummaryType;
  onHostClick?: (userId: number) => void;
}

const formatDate = (dateStr: string): string => {
  const parsed = parseISO(dateStr);
  return isValid(parsed) ? format(parsed, "yyyy/MM/dd") : dateStr;
};

const hasPhysical = (modes: string[]) => modes.includes("physical");
const hasOnline = (modes: string[]) => modes.some((m) => m === "sync" || m === "async");

export const ActivityCard = ({ activity, onHostClick }: ActivityCardProps) => {
  const t = useTranslations("explore_activities");
  const isEnded = activity.runStatus === "ended";
  const isOngoing = activity.runStatus === "ongoing";
  const colorKey = activityColorKey(activity.id);
  const themeName =
    colorKey === "blue"
      ? PracticeTheme.blue
      : colorKey === "green"
        ? PracticeTheme.green
        : colorKey === "yellow"
          ? PracticeTheme.yellow
          : PracticeTheme.pink;
  const ThemeSvg = practiceThemeSvgMap[themeName] ?? practiceThemeSvgMap[PracticeTheme.blue];

  const href = activity.isJoined ? `/cohorts/${activity.id}` : `/activities/${activity.id}`;

  const modes = activity.interactionModes ?? [];
  const showLocation = modes.length > 0;
  const physical = hasPhysical(modes);
  const online = hasOnline(modes);

  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col overflow-hidden rounded-[20px] border border-[#E4EAE9] bg-white transition-all duration-160",
        "hover:-translate-y-[3px] hover:border-logo-cyan/50 hover:shadow-[0_12px_26px_rgba(15,48,54,0.09)]"
      )}
    >
      {/* Color band */}
      <div
        className={cn("relative h-[34px] overflow-hidden", isEnded && "saturate-[.3] opacity-65")}
      >
        <ThemeSvg className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" />
        {activity.templateCount > 0 && (
          <span className="absolute right-3 top-1.5 inline-flex items-center rounded-full bg-white/90 px-2 py-0.5 text-[11px] text-text-dark/70">
            {t("template_count", { count: activity.templateCount })}
          </span>
        )}
        {isOngoing && (
          <span className="absolute left-3 top-1.5 inline-flex items-center rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-medium text-logo-cyan">
            {t("badge_ongoing")}
          </span>
        )}
        {isEnded && (
          <span className="absolute left-3 top-1.5 inline-flex items-center rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-medium text-text-dark/60">
            {t("badge_ended")}
          </span>
        )}
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col gap-[7px] px-4 pt-3.5 pb-4">
        <h3
          className={cn(
            "line-clamp-1 text-base font-semibold",
            isEnded ? "text-bg-dark/85" : "text-bg-dark"
          )}
        >
          {activity.displayName}
        </h3>

        <p
          className={cn(
            "line-clamp-4 min-h-[85px] text-[12.5px] leading-[1.7]",
            isEnded ? "text-text-dark/55" : "text-text-dark/70"
          )}
        >
          {activity.tagline ?? activity.description ?? ""}
        </p>

        {/* Date row */}
        <span className="flex items-center gap-1 text-xs text-text-dark/60">
          <Calendar className="size-[13px] shrink-0" />
          {formatDate(activity.startDate)}&ndash;{formatDate(activity.endDate)}
        </span>

        {/* Location row */}
        {showLocation && (
          <span className="flex items-center gap-1 text-xs text-text-dark/60">
            {physical ? (
              <>
                <MapPin className="size-[13px] shrink-0" />
                {online
                  ? t("location_hybrid", { location: activity.location ?? "" })
                  : (activity.location ?? "")}
              </>
            ) : (
              <>
                <Globe className="size-[13px] shrink-0" />
                {t("location_online")}
              </>
            )}
          </span>
        )}

        {/* Separator + host + fee row */}
        <div className="mt-1.5 flex items-center justify-between border-t border-[#EEF3F3] pt-3">
          <span className="flex items-center gap-1.5 text-xs text-text-dark/60">
            {activity.host.avatar ? (
              <img
                src={activity.host.avatar}
                alt={activity.host.name}
                className="size-5 rounded-full object-cover"
              />
            ) : (
              <DefaultAvatarSvg className="size-5 rounded-full" />
            )}
            {onHostClick && activity.host.userId ? (
              <button
                type="button"
                role="button"
                className="cursor-pointer text-text-dark/70 underline-offset-2 hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onHostClick(activity.host.userId!);
                }}
              >
                {activity.host.name}
              </button>
            ) : (
              <span>{activity.host.name}</span>
            )}
            {isEnded
              ? t("members_count_ended", { count: activity.participantCount })
              : isOngoing
                ? t("members_count", { count: activity.participantCount })
                : null}
          </span>

          <div className="flex items-center gap-2">
            {/* Fee badge */}
            {activity.feeType === "free" ? (
              <span
                className={cn(
                  "rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-text-dark/60",
                  isEnded && "opacity-60"
                )}
              >
                {t("fee_free")}
              </span>
            ) : (
              <span
                className={cn(
                  "rounded-full bg-[#E0F5F4] px-2 py-0.5 text-[11px] font-semibold text-logo-cyan",
                  isEnded && "opacity-60"
                )}
              >
                {activity.feeAmount != null
                  ? t("fee_amount", { amount: activity.feeAmount.toLocaleString() })
                  : t("fee_paid")}
              </span>
            )}

            {/* Arrow */}
            <span className="flex size-7 items-center justify-center rounded-full bg-[#F0F6F5]">
              <ChevronRight className="size-3.5 text-text-dark/40" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};
