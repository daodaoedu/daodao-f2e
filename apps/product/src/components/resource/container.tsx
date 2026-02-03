"use client";

import { ArrowRightIcon } from "lucide-react";
import { cn } from "@daodao/ui/lib/utils";
import { Badge } from "@daodao/ui/components/badge";
import { Button } from "@daodao/ui/components/button";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { Image } from "@daodao/ui/components/image";
import { HOT_TAGS, type ICategory } from "@/constants/resource";
import { ResourceCard, ResourceCardSkeleton } from "./card";
import emptyPng from "@daodao/assets/images/common/empty.png";

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
  return (
    <div className="flex flex-col items-center rounded-xl bg-primary-palest p-10">
      {parentCategoryHasData ? (
        <>
          <p>這邊沒有符合篩選條件的學習資源！</p>
          <p>
            但我們在
            <b className="px-0.5 font-bold">{parentCategory?.[parentCategory.length - 1]?.label}</b>
            內發現了
            <b className="px-0.5 font-bold">{parentDataCount}</b>筆 有趣的學習資源~
          </p>
        </>
      ) : (
        <p>這邊沒有符合的學習資源！ 試試看其他關鍵字!</p>
      )}
      <Image className="mb-6 mt-4" src={emptyPng} alt="empty" width={210} height={210} />
      {parentCategoryHasData ? (
        <Button asChild size="default">
          <CustomLink href={`/resource/categories/${parentCategory.map((c) => c.value).join("/")}`}>
            <ArrowRightIcon size={15} />
            馬上去探索
          </CustomLink>
        </Button>
      ) : (
        <>
          <div className="mb-3 font-bold text-basic-500">熱門標籤</div>
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
