"use client";

import { useExtractOgImage } from "@daodao/api";
import { BookSvg } from "@daodao/assets";
import { useTranslations } from "@daodao/i18n";
import { Image } from "@daodao/ui/components/image";
import { cn } from "@daodao/ui/lib/utils";
import { Link2Icon, X } from "lucide-react";
import * as React from "react";

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

const ResourceCardComponent = ({ resource, className, onClick, onRemove }: ResourceCardProps) => {
  const t = useTranslations("practice");
  const [imageError, setImageError] = React.useState(false);
  const { data: ogImageData, isLoading } = useExtractOgImage(resource.url);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.();
    }
  };

  // 決定顯示的圖片：優先使用 og:image，如果沒有或載入失敗則顯示預設圖示
  const ogImageUrl = ogImageData?.ogImageUrl ?? null;
  const shouldShowDefaultIcon = !ogImageUrl || imageError || isLoading || !resource.url;

  const cardContent = (
    <>
      <div className="relative aspect-169/93 rounded-t-lg overflow-hidden bg-bg-gray">
        {shouldShowDefaultIcon ? (
          <div className="absolute inset-0 flex items-center justify-center bg-light-cyan">
            {isLoading ? (
              <div className="size-8 border-2 border-logo-cyan border-t-transparent rounded-full animate-spin" />
            ) : (
              <BookSvg width={100} height={95} className="opacity-50" />
            )}
          </div>
        ) : (
          <Image
            src={ogImageUrl}
            alt={resource.name}
            onError={() => setImageError(true)}
            fill
            className="object-cover"
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
            aria-label={t("resource_remove_aria")}
          >
            <X className="size-3" />
          </button>
        )}
      </div>
      <div className="flex items-center justify-between gap-1 text-xs text-text-dark p-2">
        <span className="line-clamp-1">{resource.name}</span>
        {resource.url && <Link2Icon className="size-4 text-logo-cyan shrink-0" />}
      </div>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        onKeyDown={handleKeyDown}
        aria-label={t("resource_open_aria", { name: resource.name })}
        className={cn(
          "rounded-lg border border-logo-cyan bg-white cursor-pointer transition-shadow hover:shadow-md",
          className
        )}
      >
        {cardContent}
      </button>
    );
  }

  return (
    <div className={cn("rounded-lg border border-logo-cyan bg-white", className)}>
      {cardContent}
    </div>
  );
};

export const ResourceCard = React.memo(ResourceCardComponent, (prevProps, nextProps) => {
  // 只比較 resource 對象，忽略 onRemove 和 onClick 的變化
  return (
    prevProps.resource.id === nextProps.resource.id &&
    prevProps.resource.name === nextProps.resource.name &&
    prevProps.resource.url === nextProps.resource.url &&
    prevProps.className === nextProps.className
  );
});
