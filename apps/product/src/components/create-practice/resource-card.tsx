"use client";

import { Link2Icon, X } from "lucide-react";
import * as React from "react";

import { Image } from "@daodao/ui/components/image";
import { cn } from "@daodao/ui/lib/utils";
import { BookSvg } from "@daodao/assets";

export interface ResourceCardData {
  id: string | number;
  name: string;
  url?: string;
}

export interface ResourceCardProps {
  resource: ResourceCardData;
  className?: string;
  onClick?: () => void;
  onRemove?: () => void;
}

export const ResourceCard = ({
  resource,
  className,
  onClick,
  onRemove,
}: ResourceCardProps) => {
  const [imageError, setImageError] = React.useState(false);
  return (
    <div
      className={cn(
        "rounded-lg border border-logo-cyan bg-white",
        onClick && "cursor-pointer transition-shadow hover:shadow-md",
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      aria-label={onClick ? `開啟資源：${resource.name}` : undefined}
    >
      <div className="relative aspect-169/93 rounded-t-lg overflow-hidden bg-bg-gray">
        {imageError || !resource.url ? (
          <div className="absolute inset-0 flex items-center justify-center bg-light-cyan">
            <BookSvg width={100} height={95} className="opacity-50" />
          </div>
        ) : (
          <Image
            src={resource.url}
            alt={resource.name}
            onError={() => setImageError(true)}
            fill
          />
        )}
        {onRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="absolute top-2 right-2 size-5 bg-[#295E5C66]/40 text-white rounded-full flex items-center justify-center hover:bg-[#295E5C66]/60 transition-colors"
            aria-label="移除資源"
          >
            <X className="size-3" />
          </button>
        )}
      </div>
      <div className="flex items-center justify-between gap-1 text-xs text-text-dark p-2">
        <span className="line-clamp-1">{resource.name}</span>
        {resource.url && (
          <Link2Icon className="size-4 text-logo-cyan shrink-0" />
        )}
      </div>
    </div>
  );
};
