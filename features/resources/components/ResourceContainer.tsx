import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import EmptyPng from "@/public/assets/images/empty.png";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ResourceListResponseSchema,
  resourceSchema,
} from "@/services/resources";
import { cn } from "@/utils/cn";
import ResourceCard from "./ResourceCard";
import { CategoriesType } from "../utils/getCategories";

interface ResourceContainerProps {
  data: ResourceListResponseSchema["resources"];
  categories?: CategoriesType;
  parentDataCount?: number;
  className?: string;
}

function ResourceContainer({
  data,
  categories,
  parentDataCount,
  className,
}: ResourceContainerProps) {
  const safeData = Array.isArray(data)
    ? data.filter((resource) => resourceSchema.safeParse(resource).success)
    : [];
  const parentCategory = categories?.slice(0, -1) ?? [];
  const parentCategoryHasData =
    parentCategory.length > 0 && parentDataCount && parentDataCount > 0;

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {safeData.map((resource) => (
        <ResourceCard
          key={resource.id}
          id={resource.id}
          title={resource.name}
          content={resource.description}
          tags={resource.tags}
          userName={resource.user.name}
          coverImageUrl={resource.imageUrl ?? undefined}
          time={resource.createdAt}
          level={resource.level}
          commentCount={resource.reviewCount}
          userAvatar={resource.user.photoURL}
          viewCount={resource.viewCount.toString()}
        />
      ))}

      {safeData.length === 0 && (
        <div className="body-md px-5 pb-16 md:px-24">
          <div className="flex flex-col items-center bg-primary-palest p-10 rounded-xl">
            {parentCategoryHasData ? (
              <>
                <p>這邊沒有符合篩選條件的學習資源！</p>
                <p>
                  但我們在
                  <b className="font-bold px-0.5">
                    {categories?.[categories.length - 1]?.label}
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
                  {Array.from({ length: 5 }, (_, i) => i).map((key) => (
                    <Badge key={key} variant="outline" asChild>
                      <Link
                        href={`/resource/categories/${categories
                          ?.map((c) => c.value)
                          .join("/")}`}
                      >
                        # Tag
                      </Link>
                    </Badge>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ResourceContainer;
