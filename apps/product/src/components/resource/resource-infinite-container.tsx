"use client";

import { useEffect, useRef } from "react";
import { useInfiniteResources, type IGetResourceListParams } from "@daodao/api";
import { cn } from "@daodao/ui/lib/utils";
import { ResourceCard, ResourceCardSkeleton } from "./card";

interface ResourceInfiniteContainerProps {
  params?: Omit<IGetResourceListParams, "cursor">;
  className?: string;
  /** 從 Server Component 傳入的總數（來自 getResourceStats） */
  totalCount?: number;
}

export function ResourceInfiniteContainer({
  params,
  className,
  totalCount: serverTotalCount,
}: ResourceInfiniteContainerProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { data, isLoading, isValidating, hasMore, totalCount, loadMore } =
    useInfiniteResources(params);

  // 優先使用從 Server 傳入的總數
  const displayTotalCount = serverTotalCount ?? totalCount;

  // 使用 Intersection Observer 實現無限滾動
  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && hasMore && !isValidating) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isValidating, loadMore]);

  return (
    <div className={cn("flex flex-col", className)}>
      {/* 總數顯示 */}
      <div className="mb-6 text-basic-500">
        共 <span className="font-bold text-primary-base">{displayTotalCount}</span> 筆資源
      </div>

      {/* 資源列表 */}
      <div className="flex flex-col gap-6">
        {data.map((resource) => (
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

        {/* 載入中狀態 */}
        {(isLoading || isValidating) && (
          <>
            <ResourceCardSkeleton />
            <ResourceCardSkeleton />
            <ResourceCardSkeleton />
          </>
        )}

        {/* 空狀態 */}
        {!isLoading && data.length === 0 && (
          <div className="flex flex-col items-center rounded-xl bg-primary-palest p-10">
            <p className="text-basic-500">這個分類目前沒有學習資源</p>
          </div>
        )}
      </div>

      {/* 載入更多的觸發元素 */}
      {hasMore && <div ref={loadMoreRef} className="h-10" />}

      {/* 已載入全部 */}
      {!hasMore && data.length > 0 && !isLoading && (
        <div className="mt-8 text-center text-basic-400">已顯示全部資源</div>
      )}
    </div>
  );
}
