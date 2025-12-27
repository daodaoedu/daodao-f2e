"use client";

import { Button } from "@daodao/ui/components/button";
import { cn } from "@daodao/ui/lib/utils";
import { Calendar, ChevronRight, MessageCircle } from "lucide-react";
import * as React from "react";

interface InProgressTaskCardProps {
  label: string;
  title: string;
  description: string;
  progress: string;
  engagementCount: number;
  backgroundColor?: string;
  onCheckIn?: () => void;
}

export const InProgressTaskCard = ({
  label,
  title,
  description,
  progress,
  engagementCount,
  backgroundColor = "bg-yellow-100",
  onCheckIn,
}: InProgressTaskCardProps) => {
  return (
    <div
      className={cn(
        "relative flex flex-col gap-3 rounded-[12px] p-5 transition-shadow hover:shadow-sm",
        backgroundColor
      )}
    >
      {/* Label */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <ChevronRight className="size-5 text-muted-foreground" />
      </div>

      {/* Title */}
      <h3 className="line-clamp-2 text-lg font-semibold truncate">{title}</h3>

      {/* Description */}
      <p className="line-clamp-2 text-sm text-muted-foreground flex-1">{description}</p>

      {/* Progress */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{progress}</span>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MessageCircle className="size-4" />
          <span>{engagementCount}</span>
        </div>
      </div>

      {/* Check-in Button */}
      <Button
        variant="secondary"
        size="sm"
        onClick={onCheckIn}
        className="mt-2 bg-white text-foreground hover:bg-white/90"
      >
        <Calendar className="size-4" />
        打卡
      </Button>
    </div>
  );
};

