"use client";

import { ArrowRightOutlineSvg, MessagesSvg } from "@daodao/assets";
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
}: InProgressTaskCardProps) => {
  const themeName = getThemeNameFromColor(theme);
  const Theme = practiceThemeSvgMap[themeName] ?? practiceThemeSvgMap[PracticeTheme.yellow];
  const statusInfo = getStatusConfig(status);
  const isDraft = status === TaskStatus.draft;

  return (
    <div className="relative w-[294px]">
      <Theme className="rounded-[12px]" />
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
              <Button variant="ghost" size="icon" asChild>
                <CustomLink href={`/practices/${id}`}>
                  <ArrowRightOutlineSvg className="size-6 text-light-gray" />
                </CustomLink>
              </Button>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between">
          <span className="text-xs flex gap-1">
            <span className="text-text-dark">已打卡</span>
            <span className="text-text-dark font-semibold">{checkInCount}</span>
            <span className="text-text-dark">次</span>
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

        {/* Check-in Button */}
        {isDraft ? (
          <Button variant="secondary" asChild>
            <CustomLink href={`/practices/${id}/edit`}>
              <PenLine className="size-4.5 text-logo-cyan" />
              繼續編輯
            </CustomLink>
          </Button>
        ) : (
          <CheckInButton
            variant="secondary"
            className="w-full sm:max-w-[288px]"
            practiceId={id}
            practiceStatus={status}
            lastCheckInDate={lastCheckInDate ?? null}
            taskTitle={title}
            showIcon
            progressPercentage={progress}
          />
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 overflow-hidden rounded-b-full">
        <Progress value={progress} />
      </div>
    </div>
  );
};
