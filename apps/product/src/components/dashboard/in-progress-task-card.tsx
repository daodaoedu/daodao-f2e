"use client";

import { ArrowRightOutlineSvg, MessagesSvg } from "@daodao/assets";
import { useTranslations } from "@daodao/i18n";
import { Badge } from "@daodao/ui/components/badge";
import { Button } from "@daodao/ui/components/button";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { Progress } from "@daodao/ui/components/progress";
import { cn } from "@daodao/ui/lib/utils";
import { isBefore, isValid, parseISO, startOfDay } from "date-fns";
import { Calendar, CalendarCheck, PenLine, Timer, Users } from "lucide-react";
import { CheckInButton } from "@/components/check-in";
import {
  getThemeNameFromColor,
  PracticeTheme,
  practiceThemeSvgMap,
} from "@/constants/practice-theme";
import { getStatusConfig, TaskStatus } from "@/constants/task-status";
import { calculateDaysProgress, formatCardDate } from "@/utils/practice-card";

interface InProgressTaskCardProps {
  id: string;
  title: string;
  description: string;
  checkInCount: number;
  progress: number;
  messagesCount: number;
  isUnreadMessages: boolean;
  theme: string;
  status: string;
  lastCheckInDate?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  onEdit?: () => void;
  /** 草稿按鈕文案；期程指派的草稿是「啟用」而非「繼續編輯」 */
  draftActionLabel?: string;
  /** Cohort practice cards use the shared program-card layout and omit the draft status. */
  cohortCard?: boolean;
  /** Runs before a cohort draft opens the check-in form, activating it first. */
  onBeforeCheckIn?: () => Promise<boolean>;
}

export const InProgressTaskCard = ({
  id,
  title,
  description,
  checkInCount,
  progress,
  messagesCount,
  isUnreadMessages,
  theme,
  status,
  lastCheckInDate,
  startDate,
  endDate,
  onEdit,
  draftActionLabel,
  cohortCard = false,
  onBeforeCheckIn,
}: InProgressTaskCardProps) => {
  const t = useTranslations("dashboard");
  const tCheckIn = useTranslations("check_in");
  const themeName = getThemeNameFromColor(theme);
  const Theme = practiceThemeSvgMap[themeName] ?? practiceThemeSvgMap[PracticeTheme.yellow];
  const isDraft = status === TaskStatus.draft;
  const displayStatus = cohortCard && isDraft ? TaskStatus.notStarted : status;
  const statusInfo = getStatusConfig(displayStatus);
  const formattedStartDate = formatCardDate(startDate);
  const daysProgress = calculateDaysProgress(startDate, endDate);
  const isBeforeStartDate = (() => {
    if (!cohortCard || !startDate) return false;
    const parsedStartDate = parseISO(startDate);
    return isValid(parsedStartDate) && isBefore(startOfDay(new Date()), startOfDay(parsedStartDate));
  })();
  let statusLabel = statusInfo?.label;
  if (displayStatus === TaskStatus.draft) statusLabel = t("filter_draft");
  else if (displayStatus === TaskStatus.notStarted) statusLabel = t("filter_not_started");
  else if (displayStatus === TaskStatus.inProgress) statusLabel = t("filter_in_progress");
  else if (displayStatus === TaskStatus.completed) statusLabel = t("filter_completed");

  return (
    <CustomLink
      href={`/practices/${id}`}
      className="relative block w-[294px] h-[239px] md:w-full rounded-[12px] overflow-hidden cursor-pointer text-left hover:scale-[1.02] hover:shadow-md transition-all duration-200"
    >
      <Theme
        className="absolute inset-0 w-full h-full rounded-[12px]"
        preserveAspectRatio="xMidYMid slice"
      />

      {/* Main content — flex-1 absorbs available space, clips if overflow */}
      <div className={cn("absolute inset-0 p-5 pb-4 z-10 flex flex-col", cohortCard && "pb-6")}>
        <div className="flex-1 min-h-0 flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
              {statusInfo && (
                <Badge variant={statusInfo.variant} size="sm" className="w-fit">
                  {statusLabel}
                </Badge>
              )}
              {cohortCard && (
                <span
                  aria-hidden="true"
                  className="inline-flex size-6 shrink-0 items-center justify-center rounded-full border border-[#B9C8CC] bg-transparent"
                >
                  <Users className="size-4 text-text-dark" />
                </span>
              )}
            </div>

            <div className="flex justify-between gap-2">
              <div className="flex flex-col gap-2">
                <h3 className="line-clamp-1 text-xl font-medium text-bg-dark">{title}</h3>
                <p className="line-clamp-2 text-xs text-text-dark">{description}</p>
              </div>
              <div className="shrink-0 self-center">
                <span className="inline-flex items-center justify-center size-10">
                  <ArrowRightOutlineSvg className="size-6 text-light-gray" />
                </span>
              </div>
            </div>
          </div>

          {/* Start date + days progress */}
          {(formattedStartDate !== null || daysProgress !== null) && (
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
          )}

          {/* Check-in count */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-xs text-text-dark">
              <CalendarCheck className="size-3.5 shrink-0" />
              {cohortCard && isBeforeStartDate
                ? t("cohort_check_in_before_start")
                : cohortCard && checkInCount === 0
                  ? t("cohort_check_in_first")
                  : checkInCount === 0
                    ? t("checked_in_count_zero")
                    : t.rich("checked_in_count", {
                        count: checkInCount,
                        bold: (chunks) => <span className="font-semibold">{chunks}</span>,
                      })}
            </span>
            {/* TODO: MVP 先不開放 */}
            <div className="hidden items-center gap-1">
              <MessagesSvg className="size-4 text-text-dark" />
              {isUnreadMessages ? (
                <Badge variant="alert" size="xs" className="font-semibold min-w-5.5 justify-center">
                  {messagesCount}
                </Badge>
              ) : (
                <span className="text-text-dark text-xs font-semibold">{messagesCount}</span>
              )}
            </div>
          </div>
        </div>

        {/* Check-in Button — always visible at bottom, separated from content */}
        {/* biome-ignore lint/a11y/noStaticElementInteractions: 此處用於阻止事件冒泡到父元素 */}
        <span
          className={cn("mt-3 shrink-0 block", cohortCard && "mt-2 flex justify-end")}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onKeyDown={(e) => {
            e.stopPropagation();
          }}
        >
          {isDraft && !cohortCard ? (
            <Button variant="secondary" onClick={onEdit}>
              <PenLine className="size-4.5 text-logo-cyan" />
              {draftActionLabel ?? t("continue_editing")}
            </Button>
          ) : (
            <CheckInButton
              variant="secondary"
              className={cn(
                cohortCard
                  ? "h-7 w-fit gap-1.5 px-3 py-1 text-[13px] [&_svg]:size-4"
                  : "w-full sm:max-w-[288px]"
              )}
              practiceId={id}
              practiceStatus={cohortCard && isDraft ? TaskStatus.notStarted : status}
              lastCheckInDate={lastCheckInDate ?? null}
              startDate={startDate ?? null}
              endDate={endDate ?? null}
              taskTitle={title}
              labelOverride={cohortCard ? tCheckIn("button_check_in") : undefined}
              beforeCheckIn={cohortCard && isDraft ? onBeforeCheckIn : undefined}
              disableBeforeStartDate={cohortCard}
              showIcon
              progressPercentage={progress}
            />
          )}
        </span>
      </div>

      {/* Progress bar — always at card bottom */}
      <div
        className={cn(
          "absolute z-10 overflow-hidden",
          cohortCard ? "bottom-[6px] left-5 right-5" : "bottom-0 left-0 right-0"
        )}
      >
        <Progress
          value={progress}
          className={cn(
            cohortCard &&
              "h-1.5 bg-white/75 shadow-[inset_0_0_0_1px_rgba(15,48,54,0.08)] [--active-color:oklch(0.711_0.12_190.6)]"
          )}
        />
      </div>
    </CustomLink>
  );
};
