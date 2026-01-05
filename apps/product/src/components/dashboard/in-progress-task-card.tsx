"use client";

import {
  ArrowRightOutlineSvg,
  BlueSvg,
  GreenSvg,
  MessagesSvg,
  PinkSvg,
  YellowSvg,
} from "@daodao/assets";
import { Badge, type BadgeProps } from "@daodao/ui/components/badge";
import { Button } from "@daodao/ui/components/button";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { Progress } from "@daodao/ui/components/progress";
import { CalendarCheck, PenLine } from "lucide-react";

const themesMap = {
  yellow: YellowSvg,
  blue: BlueSvg,
  pink: PinkSvg,
  green: GreenSvg,
};

export type TaskStatus = "draft" | "not-started" | "in-progress" | "completed";

const statusConfig: Record<
  TaskStatus,
  {
    label: string;
    variant: BadgeProps["variant"];
    icon: React.ReactNode;
    buttonLabel: string;
  }
> = {
  draft: {
    label: "草稿",
    variant: "outline-ghost",
    icon: <PenLine className="size-4.5 text-logo-cyan" />,
    buttonLabel: "繼續編輯",
  },
  "not-started": {
    label: "未開始",
    variant: "very-light-blue",
    icon: <CalendarCheck className="size-4.5 text-logo-cyan" />,
    buttonLabel: "打卡",
  },
  "in-progress": {
    label: "進行中",
    variant: "default",
    icon: <CalendarCheck className="size-4.5 text-logo-cyan" />,
    buttonLabel: "打卡",
  },
  completed: {
    label: "已完成",
    variant: "default",
    icon: <CalendarCheck className="size-4.5 text-logo-cyan" />,
    buttonLabel: "打卡",
  },
};

interface InProgressTaskCardProps {
  label: string;
  id: string;
  title: string;
  description: string;
  progress: string;
  messagesCount: number;
  isUnreadMessages: boolean;
  isCheckIn: boolean;
  theme: string;
  status: string;
  onCheckIn?: () => void;
  onEdit?: () => void;
}

export const InProgressTaskCard = ({
  label,
  id,
  title,
  description,
  progress,
  messagesCount,
  isUnreadMessages,
  isCheckIn,
  theme,
  status,
  onCheckIn,
  onEdit,
}: InProgressTaskCardProps) => {
  const Theme = themesMap[theme as keyof typeof themesMap] ?? YellowSvg;
  const statusInfo = statusConfig[status as TaskStatus] ?? statusConfig.draft;
  const isDraft = status === "draft";

  const handleButtonClick = () => {
    if (isDraft) {
      onEdit?.();
    } else {
      onCheckIn?.();
    }
  };

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
            <span className="text-text-dark font-semibold">{progress}</span>
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
        <Button variant="secondary" onClick={handleButtonClick} disabled={isCheckIn}>
          {statusInfo.icon}
          {isCheckIn ? "今天已打過卡囉！" : statusInfo.buttonLabel}
        </Button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 overflow-hidden rounded-b-full">
        <Progress value={23} />
      </div>
    </div>
  );
};
