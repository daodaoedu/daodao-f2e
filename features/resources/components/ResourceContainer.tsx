import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import EmptyPng from "@/public/assets/images/empty.png";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HOT_TAGS, ICategory } from "@/constants/category";
import { ResourceListResponseSchema } from "@/services/resources";
import { cn } from "@/utils/cn";
import ResourceCard, { ResourceCardSkeleton } from "./ResourceCard";

interface EmptyDataProps {
  parentCategoryHasData: boolean;
  parentCategory: ICategory[];
  parentDataCount: number;
}

function EmptyData({
  parentCategoryHasData,
  parentCategory,
  parentDataCount,
}: EmptyDataProps) {
  return (
    <div className="flex flex-col items-center bg-primary-palest p-10 rounded-xl">
      {parentCategoryHasData ? (
        <>
          <p>這邊沒有符合篩選條件的學習資源！</p>
          <p>
            但我們在
            <b className="font-bold px-0.5">
              {parentCategory?.[parentCategory.length - 1]?.label}
            </b>
            內發現了
            <b className="font-bold px-0.5">{parentDataCount}</b>筆
            有趣的學習資源~
          </p>
        </>
      ) : (
        <p>這邊沒有符合的學習資源！ 試試看其他關鍵字!</p>
      )}
      <Image
        className="mt-4 mb-6"
        src={EmptyPng}
        alt="empty"
        width={210}
        height={210}
      />
      {parentCategoryHasData ? (
        <Button asChild size="lg">
          <Link
            href={`/resource/categories/${parentCategory
              .map((c) => c.value)
              .join("/")}`}
          >
            <ArrowRightIcon size={15} />
            馬上去探索
          </Link>
        </Button>
      ) : (
        <>
          <div className="mb-3 font-bold text-basic-500">熱門標籤</div>
          <div className="flex gap-2">
            {HOT_TAGS.map(({ label, value }) => (
              <Badge key={value} variant="outline" asChild>
                <Link href={`/resource/categories/${value}`}>#{label}</Link>
              </Badge>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

interface ResourceContainerProps {
  data: ResourceListResponseSchema["data"]["resources"];
  categories?: ICategory[];
  parentDataCount?: number;
  className?: string;
  isLoading?: boolean;
  isValidating?: boolean;
}

function ResourceContainer({
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
      {!isLoading && safeData.map((resource) => (
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

export default ResourceContainer;
