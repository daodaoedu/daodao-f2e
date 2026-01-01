"use client";

import { MessagesSvg } from "@daodao/assets";
import { Badge } from "@daodao/ui/components/badge";
import { cn } from "@daodao/ui/lib/utils";
import { Eye } from "lucide-react";

interface CompletedTaskCardProps {
  label: string;
  title: string;
  viewCount: number;
  commentCount: number;
  tags: string[];
  className?: string;
}

export const CompletedTaskCard = ({
  label,
  title,
  viewCount,
  commentCount,
  tags,
  className,
}: CompletedTaskCardProps) => {
  return (
    <div
      className={cn(
        "flex justify-between gap-1 rounded-[12px] border border-border bg-white px-4 py-3 transition-shadow hover:shadow-sm",
        className
      )}
    >
      <div className="flex flex-col gap-1">
        {/* Label */}
        <Badge variant="outline-logo" size="sm" className="w-fit">
          {label}
        </Badge>

        {/* Title */}
        <h3 className="font-medium text-text-dark">{title}</h3>

        {/* Engagement Stats */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <Eye className="size-4 text-text-dark" />
            <span className="text-text-dark">{viewCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessagesSvg className="size-4 text-text-dark" />
            <span className="text-text-dark">{commentCount}</span>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="flex h-fit flex-wrap gap-2">
        {tags.slice(0, 2).map((tag) => (
          <Badge key={tag} variant="gray" size="sm">
            {tag}
          </Badge>
        ))}
        {tags.length > 2 && (
          <span className="text-xs text-basic-400 py-0.5">+{tags.length - 2}</span>
        )}
      </div>
    </div>
  );
};
