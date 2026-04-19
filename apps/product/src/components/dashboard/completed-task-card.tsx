"use client";

import { ArrowRightOutlineSvg, MessagesSvg } from "@daodao/assets";
import { Badge } from "@daodao/ui/components/badge";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { cn } from "@daodao/ui/lib/utils";
import { Eye } from "lucide-react";

interface CompletedTaskCardProps {
  label: string;
  id: string;
  title: string;
  description: string;
  viewCount: number;
  commentCount: number;
  tags: string[];
  className?: string;
}

export const CompletedTaskCard = ({
  label,
  id,
  title,
  description,
  viewCount,
  commentCount,
  tags,
  className,
}: CompletedTaskCardProps) => {
  return (
    <CustomLink
      href={`/practices/${id}`}
      className={cn(
        "flex flex-col gap-1 rounded-[12px] border border-border bg-white px-4 py-3 overflow-hidden transition-all duration-200 hover:shadow-md hover:scale-[1.02]",
        className
      )}
    >
      <div className="flex justify-between gap-1">
        {/* Label */}
        <Badge variant="outline-logo" size="sm" className="w-fit">
          {label}
        </Badge>

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

      {/* Title */}
      <div className="flex gap-2 w-full mb-1.5">
        <div className="flex-1">
          <h3 className="font-medium text-text-dark mb-1">{title}</h3>
          <p className="text-xs text-text-dark">{description}</p>
        </div>
        <div className="shrink-0 self-center">
          <ArrowRightOutlineSvg className="size-6 text-light-gray" />
        </div>
      </div>

      <div className="bg-blue rounded-full w-full h-1.5" />

      {/* Engagement Stats */}
      <div className="hidden items-center gap-3 text-xs">
        <div className="flex items-center gap-1">
          <Eye className="size-4 text-text-dark" />
          <span className="text-text-dark">{viewCount}</span>
        </div>
        <div className="flex items-center gap-1">
          <MessagesSvg className="size-4 text-text-dark" />
          <span className="text-text-dark">{commentCount}</span>
        </div>
      </div>
    </CustomLink>
  );
};
