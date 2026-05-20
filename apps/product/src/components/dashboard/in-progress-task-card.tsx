"use client";

import { ArrowRightOutlineSvg, MessagesSvg } from "@daodao/assets";
import { useTranslations } from "@daodao/i18n";
import { Badge } from "@daodao/ui/components/badge";
import { Button } from "@daodao/ui/components/button";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { Progress } from "@daodao/ui/components/progress";
import { PenLine } from "lucide-react";
import { CheckInButton } from "@/components/check-in";
import {
  getThemeNameFromColor,
  PracticeTheme,
  practiceThemeSvgMap,
} from "@/constants/practice-theme";
import { getStatusConfig, TaskStatus } from "@/constants/task-status";
import { calculateRemainingDays, formatCardDate } from "@/utils/practice-card";

interface InProgressTaskCardProps {
  label: string;
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
}

export const InProgressTaskCard = ({
  label,
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
}: InProgressTaskCardProps) => {
  const t = useTranslations("dashboard");
  const themeName = getThemeNameFromColor(theme);
  const Theme = practiceThemeSvgMap[themeName] ?? practiceThemeSvgMap[PracticeTheme.yellow];
  const statusInfo = getStatusConfig(status);
  const isDraft = status === TaskStatus.draft;
  const formattedStartDate = formatCardDate(startDate);
  const remainingDays = calculateRemainingDays(endDate);

  return (
    <CustomLink
      href={`/practices/${id}`}
      className="relative block w-[294px] h-[239px] md:w-full rounded-[12px] overflow-hidden cursor-pointer text-left hover:scale-[1.02] hover:shadow-md transition-all duration-200"
    >
      <Theme
        className="absolute inset-0 w-full h-full rounded-[12px]"
        preserveAspectRatio="xMidYMid slice"
      />
      {/* Label */}
      <div className="absolute inset-0 p-5 pb-6 z-10 flex flex-col gap-5">
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="secondary" size="sm" className="w-fit">
              {label}
            </Badge>
            {statusInfo && (
              <Badge variant={statusInfo.variant} size="sm" className="w-fit">
                {statusInfo.label}
              </Badge>
            )}
          </div>

          <div className="flex justify-between gap-2 flex-1">
            <div className="flex flex-col gap-2">
              {/* Title */}
              <h3 className="line-clamp-1 text-xl font-medium text-bg-dark">{title}</h3>

              {/* Description */}
              <div className="flex-1">
                <p className="line-clamp-2 text-xs text-text-dark">{description}</p>
              </div>
            </div>
            <div className="shrink-0 self-center">
              <span className="inline-flex items-center justify-center size-10">
                <ArrowRightOutlineSvg className="size-6 text-light-gray" />
              </span>
            </div>
          </div>
        </div>

        {/* Start date + remaining days */}
        {(formattedStartDate !== null || remainingDays !== null) && (
          <div className="flex items-center gap-2 text-xs text-text-dark">
            {formattedStartDate !== null && (
              <span>{t("start_date_prefix", { date: formattedStartDate })}</span>
            )}
            {remainingDays !== null && (
              <span className={remainingDays < 0 ? "text-red-500" : ""}>
                {remainingDays > 0
                  ? t("days_remaining", { days: remainingDays })
                  : remainingDays === 0
                    ? t("due_today")
                    : t("overdue_days", { days: Math.abs(remainingDays) })}
              </span>
            )}
          </div>
        )}

        {/* Progress */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-dark">
            {t.rich("checked_in_count", {
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

        {/* Check-in Button - span 用於阻止點擊事件冒泡和導航 */}
        {/* biome-ignore lint/a11y/noStaticElementInteractions: 此處用於阻止事件冒泡到父元素 */}
        <span
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onKeyDown={(e) => {
            e.stopPropagation();
          }}
        >
          {isDraft ? (
            <Button variant="secondary" onClick={onEdit}>
              <PenLine className="size-4.5 text-logo-cyan" />
              {t("continue_editing")}
            </Button>
          ) : (
            <CheckInButton
              variant="secondary"
              className="w-full sm:max-w-[288px]"
              practiceId={id}
              practiceStatus={status}
              lastCheckInDate={lastCheckInDate ?? null}
              startDate={startDate ?? null}
              endDate={endDate ?? null}
              taskTitle={title}
              showIcon
              progressPercentage={progress}
            />
          )}
        </span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 overflow-hidden rounded-b-full">
        <Progress value={progress} />
      </div>
    </CustomLink>
  );
};
