"use client";

import type { ActivitySummaryType } from "@daodao/api";
import { DefaultAvatarSvg } from "@daodao/assets";
import { useTranslations } from "@daodao/i18n";
import { Link } from "@daodao/i18n/navigation";
import { Badge, type BadgeProps } from "@daodao/ui/components/badge";
import { buttonVariants } from "@daodao/ui/components/button";
import { cn } from "@daodao/ui/lib/utils";
import { Calendar, Timer, Users } from "lucide-react";
import { PracticeTheme, practiceThemeSvgMap } from "@/constants/practice-theme";
import { calculateDaysProgress, formatCardDate } from "@/utils/practice-card";

interface ActivityCardProps {
  activity: ActivitySummaryType;
}

/** 卡片背景主題：依 id 輪替（與共同挑戰卡同一套） */
const THEME_ROTATION = [
  PracticeTheme.blue,
  PracticeTheme.green,
  PracticeTheme.yellow,
  PracticeTheme.pink,
] as const;

const STATUS_BADGE: Record<ActivitySummaryType["runStatus"], BadgeProps["variant"]> = {
  upcoming: "very-light-blue",
  ongoing: "default",
  ended: "outline-logo",
};

/** 依可否加入決定 CTA 的文案與目的地：加入 → 既有邀請流程；已加入 → 學員頁；其餘停用 */
const resolveCta = (activity: ActivitySummaryType) => {
  if (activity.isJoined) return { key: "cta_view" as const, href: `/cohorts/${activity.id}` };
  if (activity.canJoin && activity.joinToken)
    return { key: "cta_join" as const, href: `/cohorts/join/${activity.joinToken}` };
  const key =
    activity.unavailableReason === "full"
      ? ("cta_full" as const)
      : activity.unavailableReason === "paused"
        ? ("cta_paused" as const)
        : ("cta_expired" as const);
  return { key, href: null };
};

/**
 * 探索活動卡片：主題色背景 + 狀態 Badge + 主辦組織 + 開始日／天數進度 + 參與人數。
 * 加入走既有 /cohorts/join/[joinToken] 流程（design D2），不另開加入端點。
 */
export const ActivityCard = ({ activity }: ActivityCardProps) => {
  const t = useTranslations("explore_activities");
  const themeName = THEME_ROTATION[activity.id % THEME_ROTATION.length] ?? PracticeTheme.blue;
  const Theme = practiceThemeSvgMap[themeName] ?? practiceThemeSvgMap[PracticeTheme.blue];
  const formattedStartDate = formatCardDate(activity.startDate);
  const daysProgress = calculateDaysProgress(activity.startDate, activity.endDate);
  const cta = resolveCta(activity);

  return (
    <div className="relative h-[239px] w-full overflow-hidden rounded-[12px] text-left">
      <Theme
        className="absolute inset-0 h-full w-full rounded-[12px]"
        preserveAspectRatio="xMidYMid slice"
      />

      <div className="absolute inset-0 z-10 flex flex-col p-5 pb-4">
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <div className="flex items-center gap-1.5">
            {activity.runStatus !== "ended" && (
              <Badge variant={STATUS_BADGE[activity.runStatus]} size="sm" className="w-fit">
                {t(`status_${activity.runStatus}`)}
              </Badge>
            )}
            {activity.isJoined && (
              <Badge variant="outline-logo" size="sm" className="w-fit">
                {t("cta_joined")}
              </Badge>
            )}
          </div>

          <h3 className="line-clamp-1 text-xl font-medium text-bg-dark">{activity.displayName}</h3>
          <p className="line-clamp-2 text-xs text-text-dark">
            {activity.description ?? activity.programName}
          </p>

          <div className="flex items-center gap-2 text-xs text-text-dark">
            {formattedStartDate !== null && (
              <span className="flex items-center gap-1">
                <Calendar className="size-3.5 shrink-0" />
                {t("card_start_date", { date: formattedStartDate })}
              </span>
            )}
            {daysProgress !== null && (
              <span className="flex items-center gap-1">
                <Timer className="size-3.5 shrink-0" />
                {t("card_days_progress", {
                  current: daysProgress.elapsed,
                  total: daysProgress.total,
                })}
              </span>
            )}
          </div>

          <span className="flex items-center gap-2 text-xs text-text-dark">
            {activity.participantCount > 0 ? (
              <span className="flex shrink-0 items-center">
                {Array.from({ length: Math.min(3, activity.participantCount) }).map((_, index) => (
                  <DefaultAvatarSvg
                    key={index}
                    className={`size-5 rounded-full shadow-[0_0_0_2px_white] ${index > 0 ? "-ml-1.75" : ""}`}
                  />
                ))}
              </span>
            ) : (
              <Users className="size-3.5 shrink-0" />
            )}
            {t("host_members", {
              host: activity.organizationName,
              count: activity.participantCount,
            })}
          </span>
        </div>

        <span className="mt-3 block shrink-0">
          {cta.href ? (
            <Link
              href={cta.href}
              className={cn(buttonVariants({ variant: "secondary" }), "w-full sm:max-w-[288px]")}
            >
              {t(cta.key)}
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className={cn(
                buttonVariants({ variant: "secondary" }),
                "pointer-events-none w-full opacity-50 sm:max-w-[288px]"
              )}
            >
              {t(cta.key)}
            </span>
          )}
        </span>
      </div>

      {daysProgress !== null && (
        <div className="absolute right-5 bottom-1.5 left-5 z-10">
          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/75 shadow-[inset_0_0_0_1px_rgba(15,48,54,0.08)]">
            <div
              className="h-full bg-logo-cyan"
              style={{ width: `${Math.round((daysProgress.elapsed / daysProgress.total) * 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
