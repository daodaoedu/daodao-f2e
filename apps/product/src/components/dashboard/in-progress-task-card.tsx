"use client";

import { BlueSvg, GreenSvg, MessagesSvg, PinkSvg, YellowSvg } from "@daodao/assets";
import { Badge } from "@daodao/ui/components/badge";
import { Button } from "@daodao/ui/components/button";
import { Progress } from "@daodao/ui/components/progress";
import { Calendar, ChevronRight } from "lucide-react";

const themesMap = {
  yellow: YellowSvg,
  blue: BlueSvg,
  pink: PinkSvg,
  green: GreenSvg,
};

interface InProgressTaskCardProps {
  label: string;
  title: string;
  description: string;
  progress: string;
  messagesCount: number;
  isUnreadMessages: boolean;
  theme: string;
  onCheckIn?: () => void;
}

export const InProgressTaskCard = ({
  label,
  title,
  description,
  progress,
  messagesCount,
  isUnreadMessages,
  theme,
  onCheckIn,
}: InProgressTaskCardProps) => {
  const Theme = themesMap[theme as keyof typeof themesMap] ?? YellowSvg;

  return (
    <div className="relative w-[294px]">
      <Theme className="rounded-[12px]" />
      {/* Label */}
      <div className="absolute inset-0 p-5 pb-6 z-10 flex flex-col gap-5">
        <div className="flex-1 flex flex-col gap-2">
          <Badge variant="secondary" size="sm" className="w-fit">
            {label}
          </Badge>

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
              <ChevronRight className="size-6 text-light-gray" />
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
          <div className="flex items-center gap-1">
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
        <Button variant="secondary" onClick={onCheckIn}>
          <Calendar className="size-4" />
          打卡
        </Button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 overflow-hidden rounded-b-full">
        <Progress value={23} />
      </div>
    </div>
  );
};
