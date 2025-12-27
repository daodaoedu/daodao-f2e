"use client";

import { Badge } from "@daodao/ui/components/badge";
import { cn } from "@daodao/ui/lib/utils";
import { Eye, MessageCircle } from "lucide-react";
import * as React from "react";

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
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>

        {/* Title */}
        <h3 className="text-lg font-semibold">{title}</h3>

        {/* Engagement Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Eye className="size-4" />
            <span>{viewCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="size-4" />
            <span>{commentCount}</span>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="flex h-fit flex-wrap gap-2">
        {tags.slice(0, 2).map((tag) => (
          <Badge key={tag} variant="secondary" size="sm">
            {tag}
          </Badge>
        ))}
        {tags.length > 2 && <span className="text-xs text-basic-500 py-0.5">+{tags.length - 2}</span>}
      </div>
    </div>
  );
};
