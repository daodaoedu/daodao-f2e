"use client";

import emptyPng from "@daodao/assets/images/common/empty.png";
import { useTranslations } from "@daodao/i18n";
import { Badge } from "@daodao/ui/components/badge";
import { Button } from "@daodao/ui/components/button";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { Image } from "@daodao/ui/components/image";
import { cn } from "@daodao/ui/lib/utils";
import { ArrowRightIcon } from "lucide-react";
import { HOT_TAGS, type ICategory } from "@/constants/resource";
import { ResourceCard, ResourceCardSkeleton } from "./card";

export interface ResourceItem {
  id: string;
  name: string;
  description: string;
  tags: string[];
  user?: {
    name: string;
    photoURL?: string | null;
  } | null;
  imageUrl?: string | null;
  createdAt: string;
  level: string;
  reviewCount?: number;
  viewCount: number;
}

interface EmptyDataProps {
  parentCategoryHasData: boolean;
  parentCategory: ICategory[];
  parentDataCount: number;
}

function EmptyData({ parentCategoryHasData, parentCategory, parentDataCount }: EmptyDataProps) {
  const t = useTranslations("resource");
  return (
    <div className="flex flex-col items-center rounded-xl bg-primary-palest p-10">
      {parentCategoryHasData ? (
        <>
          <p>{t("no_matching_resources")}</p>
          <p>
            {t.rich("found_in_parent_category", {
              categoryName: parentCategory?.[parentCategory.length - 1]?.label ?? "",
              count: parentDataCount,
              bold: (chunks) => <b className="px-0.5 font-bold">{chunks}</b>,
            })}
          </p>
        </>
      ) : (
        <p>{t("no_resources_try_other_keywords")}</p>
      )}
      <Image className="mb-6 mt-4" src={emptyPng} alt="empty" width={210} height={210} />
      {parentCategoryHasData ? (
        <Button asChild size="default">
          <CustomLink href={`/resource/categories/${parentCategory.map((c) => c.value).join("/")}`}>
            <ArrowRightIcon size={15} />
            {t("explore_now")}
          </CustomLink>
        </Button>
      ) : (
        <>
          <div className="mb-3 font-bold text-basic-500">{t("hot_tags")}</div>
          <div className="flex gap-2">
            {HOT_TAGS &&
              Array.isArray(HOT_TAGS) &&
              HOT_TAGS.map(({ label, value }) => (
                <Badge key={value} variant="outline-logo" asChild>
                  <CustomLink href={`/resource/categories/${value}`}>#{label}</CustomLink>
                </Badge>
              ))}
          </div>
        </>
      )}
    </div>
  );
}

interface ResourceContainerProps {
  data: ResourceItem[];
  categories?: ICategory[];
  parentDataCount?: number;
  className?: string;
  isLoading?: boolean;
  isValidating?: boolean;
}

export function ResourceContainer({
  data,
  categories,
  parentDataCount,
  className,
  isLoading,
  isValidating,
}: ResourceContainerProps) {
  const safeData = Array.isArray(data) ? data : [];
  const parentCategory = categories?.slice(0, -1) ?? [];
  const hasParentCategoryData =
    parentCategory.length > 0 && !!parentDataCount && parentDataCount > 0;

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {!isLoading &&
        safeData.map((resource) => (
          <ResourceCard
            key={resource.id}
            id={resource.id}
            title={resource.name}
            content={resource.description}
            tags={resource.tags}
            userName={resource.user?.name}
            coverImageUrl={resource.imageUrl ?? undefined}
            time={resource.createdAt}
            level={resource.level}
            commentCount={resource.reviewCount}
            userAvatar={resource.user?.photoURL}
            viewCount={resource.viewCount.toString()}
          />
        ))}

      {(isLoading || isValidating) && (
        <>
          <ResourceCardSkeleton />
          <ResourceCardSkeleton />
          <ResourceCardSkeleton />
        </>
      )}

      {!isLoading && safeData.length === 0 && (
        <EmptyData
          parentCategoryHasData={hasParentCategoryData}
          parentCategory={parentCategory}
          parentDataCount={parentDataCount ?? 0}
        />
      )}
    </div>
  );
}
