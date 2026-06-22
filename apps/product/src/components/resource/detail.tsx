"use client";

import type { ResourceData } from "@daodao/api";
import { BoxSvg, GroupSvg } from "@daodao/assets";
import { useTranslations } from "@daodao/i18n";
import { Badge } from "@daodao/ui/components/badge";
import { Button } from "@daodao/ui/components/button";
import { CustomLink } from "@daodao/ui/components/custom-link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@daodao/ui/components/dropdown-menu";
import { Image } from "@daodao/ui/components/image";
import { Ellipsis, Globe, Share2 } from "lucide-react";

interface ResourceDetailProps {
  resource: Pick<ResourceData, "id" | "name" | "url" | "imageUrl" | "tags" | "level" | "type">;
  onEditClick?: () => void;
  isOwnResource?: boolean;
}

export function ResourceDetail({
  resource,
  onEditClick,
  isOwnResource = false,
}: ResourceDetailProps) {
  const t = useTranslations("app_product");
  const targetAudienceLabel =
    resource.level === "beginner"
      ? t("resource_level_beginner")
      : resource.level === "intermediate"
        ? t("resource_level_intermediate")
        : resource.level === "expert"
          ? t("resource_level_expert")
          : resource.level;
  const resourceTypeLabel =
    resource.type === "learning_platform_app"
      ? t("resource_type_learning_platform_app")
      : resource.type === "learning_tools"
        ? t("resource_type_learning_tools")
        : resource.type === "books_articles"
          ? t("resource_type_books_articles")
          : resource.type === "video_content"
            ? t("resource_type_video_content")
            : resource.type === "podcast_content"
              ? t("resource_type_podcast_content")
              : resource.type === "workshops_courses"
                ? t("resource_type_workshops_courses")
                : resource.type === "professional_certificates"
                  ? t("resource_type_professional_certificates")
                  : resource.type === "community_organization"
                    ? t("resource_type_community_organization")
                    : resource.type;
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t("resource_share_text", { name: resource.name }),
          text: t("resource_share_text", { name: resource.name }),
          url: window.location.href,
        });
      } catch {
        // User cancelled or share failed
      }
    }
  };

  return (
    <div className="mb-11 mt-4 flex flex-col gap-8 rounded-xl bg-white p-10 shadow-md md:mb-12 md:flex-row">
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <h1 className="heading-lg mb-4 font-bold">{resource.name}</h1>

          <div className="mb-4 flex flex-wrap gap-2">
            {resource.tags.map((tag) => (
              <Badge key={tag} variant="outline-logo" className="text-primary">
                # {tag}
              </Badge>
            ))}
          </div>

          <div className="mb-6 flex flex-wrap gap-x-6 gap-y-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-2 font-medium">
                <GroupSvg />
                {t("resource_suitable_for")}
              </span>
              <span className="h-4 w-px bg-gray-300" />
              <span className="text-primary">{targetAudienceLabel}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-2 font-medium">
                <BoxSvg />
                {t("resource_type")}
              </span>
              <span className="h-4 w-px bg-gray-300" />
              <span className="text-primary">{resourceTypeLabel}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button size="default" asChild>
            <CustomLink href={resource.url} target="_blank">
              <Globe size={16} />
              {t("resource_view")}
            </CustomLink>
          </Button>
          <Button size="default" onClick={handleShare}>
            <Share2 size={16} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" size="icon">
                <Ellipsis size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {isOwnResource && onEditClick ? (
                <DropdownMenuItem asChild={false}>
                  <button
                    type="button"
                    onClick={onEditClick}
                    className="block w-full p-2 text-left"
                  >
                    {t("edit")}
                  </button>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem asChild>
                  <CustomLink
                    href="https://forms.gle/NkVbDWC3eXk4P4gv7"
                    target="_blank"
                    className="block p-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {t("report")}
                  </CustomLink>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="relative aspect-[320/241] overflow-hidden rounded-lg md:basis-80">
        <Image
          src={resource.imageUrl ?? ""}
          alt={resource.name}
          className="object-cover"
          fill
          priority
        />
      </div>
    </div>
  );
}
